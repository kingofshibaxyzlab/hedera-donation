import { PoolClient, QueryResult } from "pg";
import { pool } from "../config/database";
import { CampaignStatus } from "../models/enums";
import { ApprovedCampaignJoin, Campaign } from "../models/interfaces";

export const getApprovedCampaignJoins = async (): Promise<ApprovedCampaignJoin[]> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        const query = `
      SELECT 
        c.id,
        c.title,
        c.image,
        c.goal,
        c.current_amount,
        c.percentage_completed,
        c.status,
        c.created_at,
        c.updated_at,
        c.onchain_id,
        c.approved_by_admin,
        c.transaction_hash_create,
        c.transaction_hash_withdrawn,
        t.name AS token_name,
        t.symbol AS token_symbol,
        t.address AS token_address,
        t.decimal AS token_decimal,
        t.account_id AS token_account_id,
        ct.name AS campaign_type_name,
        u.username AS organizer_username,
        u.wallet_address AS organizer_wallet_address
      FROM donation_app_campaign c
      INNER JOIN donation_app_token t ON c.token_id = t.id
      INNER JOIN donation_app_campaigntype ct ON c.campaign_type_id = ct.id
      INNER JOIN donation_app_hederauser u ON c.organizer_id = u.id
      WHERE c.approved_by_admin = true AND (c.status = $1 OR c.status = $2) AND c.onchain_id IS NULL
    `;
        const result: QueryResult<ApprovedCampaignJoin> = await client.query(query, [
            CampaignStatus.NEW,
            CampaignStatus.PENDING,
        ]);
        console.log(`${result.rows.length} campaigns found.`);
        return result.rows;
    } catch (error) {
        console.error("Error fetching campaigns with joins:", error);
        return [];
    } finally {
        if (client) client.release();
    }
};

export const updateCampaignIdOnchainAndStatus = async (
    campaignId: number,
    onchainId: number,
    status: CampaignStatus,
    transactionHashCreate: string,
    transactionHashWithdrawn: string,
): Promise<boolean> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        console.log(`Updating campaign ID ${campaignId} to ${status} with onchain_id ${onchainId}`);
        const result: QueryResult = await client.query(
            "UPDATE donation_app_campaign SET status = $1, onchain_id = $2, transaction_hash_create = $3, transaction_hash_withdrawn = $4, updated_at = NOW() WHERE id = $5",
            [status, onchainId, transactionHashCreate, transactionHashWithdrawn, campaignId],
        );
        if (Number(result?.rowCount) > 0) {
            console.log(`Campaign ID ${campaignId} successfully updated.`);
            return true;
        } else {
            console.log(`Campaign ID ${campaignId} not found.`);
            return false;
        }
    } catch (error) {
        console.error("Error updating campaign:", error);
        return false;
    } finally {
        if (client) client.release();
    }
};

export const getCampaignById = async (campaignId: number): Promise<Campaign | null> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        console.log(`Searching for campaign with ID: ${campaignId}`);
        const result: QueryResult<Campaign> = await client.query(
            "SELECT * FROM donation_app_campaign WHERE id = $1 LIMIT 1",
            [campaignId],
        );
        if (result.rows.length === 0) {
            console.log(`No campaign found with ID: ${campaignId}`);
            return null;
        }
        const campaign = result.rows[0];
        console.log(`Campaign found:`, campaign);
        return campaign;
    } catch (error) {
        console.error("Error fetching campaign by ID:", error);
        return null;
    } finally {
        if (client) client.release();
    }
};

export const getCampaignByOnchainId = async (onchainId: number): Promise<Campaign | null> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        console.log(`Searching for campaign with onchain_id: ${onchainId}`);
        const result: QueryResult<Campaign> = await client.query(
            "SELECT * FROM donation_app_campaign WHERE onchain_id = $1 LIMIT 1",
            [onchainId],
        );
        if (result.rows.length === 0) {
            console.log(`No campaign found with onchain_id: ${onchainId}`);
            return null;
        }
        const campaign = result.rows[0];
        console.log(`Campaign found:`, campaign);
        return campaign;
    } catch (error) {
        console.error("Error fetching campaign by onchain_id:", error);
        return null;
    } finally {
        if (client) client.release();
    }
};
