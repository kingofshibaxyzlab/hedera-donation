import { pool } from "./config/database";
import { decodeLogs } from "./main_decodeLogs";
import { CampaignStatus } from "./models/enums";
import { DonationUpsert } from "./models/interfaces";
import { getCampaignById, getCampaignByOnchainId, updateCampaignIdOnchainAndStatus } from "./services/campaignService";
import { upsertDonationsInBatch } from "./services/donationService";
import { getUserByWalletAddress } from "./services/userService";
import { evmAddressToAccountId } from "./utils/conversions";
import { fetchLogs } from "./utils/mirrorNode";
import { processNewCampaigns } from "./worker/index";

async function processLogs(): Promise<void> {
    const KEY_CRAWL = "crawl_onchain";
    while (true) {
        let client;
        try {
            client = await pool.connect();
            console.log("Connected to PostgreSQL successfully!");

            const result = await client.query(
                "SELECT key, start_at, value FROM donation_app_lastindexcrawl WHERE key = $1 LIMIT 1",
                [KEY_CRAWL],
            );

            if (result.rows.length === 0) {
                console.log("No matching keys found in the database. Skipping iteration.");
                await new Promise((resolve) => setTimeout(resolve, 5000));
                continue;
            }

            const { key, start_at, value } = result.rows[0];
            const nowTimestamp = Math.floor(Date.now() / 1000).toString();
            const fromTimestamp = value || start_at || null;
            console.log(`Crawling logs for key "${key}" from: ${fromTimestamp} to: ${nowTimestamp}`);

            const logs = await fetchLogs(fromTimestamp, nowTimestamp);
            const jsonLogs = decodeLogs(logs);

            const donors: DonationUpsert[] = [];
            let maxTimestamp = "0";

            for (const jsonLog of jsonLogs) {
                if (Number(jsonLog.timestamp) > Number(maxTimestamp)) {
                    maxTimestamp = jsonLog.timestamp;
                }
                if (jsonLog.eventName === "DonationReceived") {
                    const transactionHash = jsonLog.transactionHash;
                    const amount = jsonLog.args.amount;
                    const accountId = (await evmAddressToAccountId(jsonLog.args.donor)).toString();
                    const user = await getUserByWalletAddress(accountId);
                    const campaign = await getCampaignByOnchainId(Number(jsonLog.args.campaignId));

                    if (!user || !campaign) continue;

                    console.log(`Transaction Hash: ${transactionHash}`);
                    console.log(`Donor Account ID: ${accountId}`);
                    console.log(`User Info:`, user);
                    console.log(`Campaign Info:`, campaign);
                    console.log(`Amount:`, amount);

                    donors.push({
                        campaignId: campaign.id,
                        userId: user.id,
                        amount: Number(amount),
                        transactionHash,
                        time: Number(jsonLog.timestamp),
                    });
                } else if (jsonLog.eventName === "CampaignPublished") {
                    const campaign = await getCampaignById(Number(jsonLog.args.offChainId));
                    const onchainId = Number(jsonLog.args.campaignId);
                    if (campaign && onchainId) {
                        await updateCampaignIdOnchainAndStatus(
                            campaign.id,
                            onchainId,
                            CampaignStatus.PUBLISHED,
                            jsonLog.transactionHash,
                            campaign.transaction_hash_withdrawn,
                        );
                    }
                } else if (jsonLog.eventName === "CampaignClosed") {
                    const campaign = await getCampaignByOnchainId(Number(jsonLog.args.campaignId));
                    if (campaign && campaign.onchain_id) {
                        await updateCampaignIdOnchainAndStatus(
                            campaign.id,
                            campaign.onchain_id,
                            CampaignStatus.CLOSED,
                            campaign.transaction_hash_create,
                            jsonLog.transactionHash,
                        );
                    }
                }
            }

            await upsertDonationsInBatch(donors);
            await processNewCampaigns();

            if (Number(maxTimestamp) > 0) {
                await client.query(
                    "UPDATE donation_app_lastindexcrawl SET value = $1, updated_at = NOW() WHERE key = $2",
                    [maxTimestamp, key],
                );
            }
            console.log(`Database updated for key "${key}" with the latest timestamp.`);
        } catch (error) {
            console.error("Error processing logs:", error);
        } finally {
            if (client) client.release();
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
    }
}

processLogs().catch((error) => {
    console.error("Fatal error in processLogs:", error);
});
