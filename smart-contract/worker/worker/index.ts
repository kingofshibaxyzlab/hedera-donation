import { ContractExecuteTransaction, ContractFunctionParameters, TransactionReceipt, PrivateKey } from "@hashgraph/sdk";
import { workerClient } from "../config/hedera";
import { CampaignPublishResult } from "../models/interfaces";
import { getApprovedCampaignJoins } from "../services/campaignService";
import { accountIdToEvmAddress } from "../utils/conversions";
import { ENV } from "../config/env";

async function publishAndApproveCampaign(campaignDetails: {
    offChainId: number;
    title: string;
    token: string;
    goal: string;
    organizer: string;
}): Promise<CampaignPublishResult | null> {
    const GAS_LIMIT = 200000;
    try {
        const functionParameters = new ContractFunctionParameters()
            .addUint256(campaignDetails.offChainId)
            .addString(campaignDetails.title)
            .addAddress(campaignDetails.token)
            .addUint256(campaignDetails.goal)
            .addAddress(campaignDetails.organizer);

        const tx = await new ContractExecuteTransaction()
            .setContractId(ENV.HEDERA_CONTRACT_ID)
            .setGas(GAS_LIMIT)
            .setFunction("publishAndApproveCampaign", functionParameters)
            .freezeWith(workerClient);

        const operatorKey = PrivateKey.fromString(ENV.HEDERA_WORKER_PRIVATE_KEY);
        const signedTx = await tx.sign(operatorKey);
        const submitTx = await signedTx.execute(workerClient);
        const receipt: TransactionReceipt = await submitTx.getReceipt(workerClient);

        console.log("Campaign published and approved. Transaction receipt:", receipt);
        return { transactionHash: submitTx.transactionId.toString() };
    } catch (error) {
        console.error("Error executing publishAndApproveCampaign:", error);
        return null;
    }
}

export const processNewCampaigns = async (): Promise<void> => {
    const pendingCampaigns = await getApprovedCampaignJoins();
    if (pendingCampaigns.length === 0) {
        console.log("No pending campaigns found.");
        return;
    }
    for (const campaign of pendingCampaigns) {
        console.log(`Processing campaign: ${campaign.title}`);
        const evmAddress = await accountIdToEvmAddress(campaign.organizer_wallet_address);
        const campaignDetails = {
            offChainId: campaign.id,
            title: campaign.title,
            token: campaign.token_address,
            goal: campaign.goal.toString(),
            organizer: evmAddress,
        };
        const publishResult = await publishAndApproveCampaign(campaignDetails);
        if (publishResult !== null) {
            console.log(
                `Campaign ID ${campaign.id} updated to PUBLISHED with transactionHash ${publishResult.transactionHash}`,
            );
        } else {
            console.error(`Failed to update campaign ID ${campaign.id}.`);
        }
    }
};
