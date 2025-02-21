import { AccountId } from "@hashgraph/sdk";
import axios from "axios";
import { ENV } from "../config/env";

export async function evmAddressToAccountId(evmAddress: string): Promise<string> {
    try {
        const formattedAddress = evmAddress.toLowerCase().startsWith("0x")
            ? evmAddress.toLowerCase()
            : `0x${evmAddress.toLowerCase()}`;
        const url = `${ENV.MIRROR_NODE}/api/v1/accounts/${formattedAddress}`;
        console.log(`Fetching account info for EVM address from: ${url}`);
        const response = await axios.get(url);
        if (response.data && response.data.account) {
            const accountId = response.data.account;
            console.log(`Hedera Account ID for EVM address ${formattedAddress}: ${accountId}`);
            return accountId;
        }
        throw new Error(`No Hedera account found for EVM address: ${formattedAddress}`);
    } catch (error) {
        console.error(`Error fetching account ID for EVM address ${evmAddress}:`, error);
        throw error;
    }
}

export function accountIdToSolidityAddress(accountId: string): string {
    try {
        const account = AccountId.fromString(accountId);
        const solidityAddress = `0x${account.toSolidityAddress()}`;
        console.log(`Solidity Address for Account ID ${accountId}: ${solidityAddress}`);
        return solidityAddress;
    } catch (error) {
        console.error(`Error converting Account ID ${accountId} to Solidity address:`, error);
        throw error;
    }
}

export async function accountIdToEvmAddress(accountId: string): Promise<string> {
    try {
        const url = `${ENV.MIRROR_NODE}/api/v1/accounts/${accountId}`;
        console.log(`Fetching EVM address for Account ID from: ${url}`);
        const response = await axios.get(url);
        if (response.data && response.data.evm_address) {
            const evmAddress = response.data.evm_address;
            console.log(`EVM Address for Account ID ${accountId}: ${evmAddress}`);
            return evmAddress;
        }
        throw new Error(`EVM address not found for Account ID: ${accountId}`);
    } catch (error) {
        console.error(`Error fetching EVM address for Account ID ${accountId}:`, error);
        throw error;
    }
}
