import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";
import { ENV } from "./env";

const network = process.env.NETWORK === "mainnet" ? "mainnet" : "testnet";

export const hederaClient = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
export const workerClient = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();

hederaClient.setOperator(AccountId.fromString(ENV.HEDERA_ACCOUNT_ID), PrivateKey.fromString(ENV.HEDERA_PRIVATE_KEY));

workerClient.setOperator(
    AccountId.fromString(ENV.HEDERA_WORKER_ACCOUNT_ID),
    PrivateKey.fromString(ENV.HEDERA_WORKER_PRIVATE_KEY),
);
