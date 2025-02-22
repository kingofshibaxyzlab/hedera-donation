import { useHashConnectContext } from "@/contexts/hashconnect";
import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Long,
  Signer,
} from "@hashgraph/sdk";
import { useState } from "react";

interface UseHederaDonateResult {
  donate: (
    contractId: string,
    campaignId: number,
    amount: string,
    gasLimit?: number
  ) => void;
  error: string | null;
  loading: boolean;
  success: boolean;
  transactionHash: string | null;
}

export const useHederaDonate = (): UseHederaDonateResult => {
  const { walletAddress, hashconnect } = useHashConnectContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const donate = async (
    contractId: string,
    campaignId: number,
    amount: string,
    gasLimit: number = 200_000
  ) => {
    if (!walletAddress) {
      setError("Wallet is not connected.");
      return null;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);
    setTransactionHash(null);

    try {
      const signer = hashconnect?.getSigner(
        AccountId.fromString(walletAddress) as any
      ) as unknown as Signer;

      const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gasLimit)
        .setFunction(
          "donate",
          new ContractFunctionParameters()
            .addUint256(campaignId) // Campaign ID
            .addUint256(Long.fromString(amount)) // Donation amount
        )
        .freezeWithSigner(signer);

      const contractExecSubmit = await transaction.executeWithSigner(signer);
      const hash = contractExecSubmit.transactionId.toString();
      setTransactionHash(hash);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to donate:", err);
      const errorMessage =
        (err as Error)?.message || "An unexpected error occurred.";
      setError(`Failed to process donation: ${errorMessage}`);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { donate, error, loading, success, transactionHash };
};
