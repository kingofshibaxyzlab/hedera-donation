import * as dotenv from "dotenv";

dotenv.config();

export const ENV = {
    HEDERA_ACCOUNT_ID: process.env.HEDERA_ACCOUNT_ID!,
    HEDERA_PRIVATE_KEY: process.env.HEDERA_PRIVATE_KEY!,
    HEDERA_CONTRACT_ID: process.env.HEDERA_CONTRACT_ID || "0.0.5224129",
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "0x0c4424e55aa698a22d8c32edef530fd071a6d2b2",
    POSTGRES_USER: process.env.POSTGRES_USER || "hedera_hackathon",
    POSTGRES_HOST: process.env.POSTGRES_HOST || "localhost",
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || "hedera_hackathon",
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "hedera_hackathon",
    POSTGRES_PORT: Number(process.env.POSTGRES_PORT) || 5432,
    RPC_URL: process.env.RPC_URL || "https://testnet.hashio.io/api",
    WORKER_PRIVATE_KEY: process.env.WORKER_PRIVATE_KEY || "",
    MIRROR_NODE: process.env.MIRROR_NODE || "https://testnet.mirrornode.hedera.com",
};
