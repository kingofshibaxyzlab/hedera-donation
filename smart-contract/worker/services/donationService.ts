import { PoolClient } from "pg";
import { pool } from "../config/database";
import { DonationUpsert } from "../models/interfaces";

export const upsertDonationsInBatch = async (donations: DonationUpsert[]): Promise<void> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        console.log("Starting batch upsert transaction...");
        await client.query("BEGIN");

        const upsertQuery = `
      INSERT INTO donation_app_donation (campaign_id, user_id, transaction_hash, amount, date)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (campaign_id, user_id, transaction_hash)
      DO UPDATE SET
        amount = EXCLUDED.amount,
        date = EXCLUDED.date
    `;

        for (const donation of donations) {
            const formattedDate =
                typeof donation.time === "number" ? new Date(donation.time * 1000).toISOString() : donation.time;
            await client.query(upsertQuery, [
                donation.campaignId,
                donation.userId,
                donation.transactionHash,
                donation.amount,
                formattedDate,
            ]);
            console.log(
                `Upserted donation: campaignId=${donation.campaignId}, userId=${donation.userId}, transactionHash=${donation.transactionHash}, date=${formattedDate}`,
            );
        }

        await client.query("COMMIT");
        console.log("Batch upsert transaction committed successfully.");
    } catch (error) {
        if (client) {
            await client.query("ROLLBACK");
            console.error("Batch upsert transaction rolled back due to an error:", error);
        } else {
            console.error("Error during batch upsert transaction:", error);
        }
    } finally {
        if (client) client.release();
    }
};
