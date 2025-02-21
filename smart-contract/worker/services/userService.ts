import { PoolClient, QueryResult } from "pg";
import { pool } from "../config/database";
import { User } from "../models/interfaces";

export const getUserByWalletAddress = async (walletAddress: string): Promise<User | null> => {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        console.log(`Searching for user with wallet address: ${walletAddress}`);
        const result: QueryResult<User> = await client.query(
            "SELECT * FROM donation_app_hederauser WHERE wallet_address = $1",
            [walletAddress],
        );
        if (result.rows.length === 0) {
            console.log(`No user found with wallet address: ${walletAddress}`);
            return null;
        }
        const user = result.rows[0];
        console.log(`User found:`, user);
        return user;
    } catch (error) {
        console.error("Error fetching user by wallet address:", error);
        return null;
    } finally {
        if (client) client.release();
    }
};
