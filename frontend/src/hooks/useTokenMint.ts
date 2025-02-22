import { useHashConnectContext } from "@/contexts/hashconnect";
import { accountIdToEvmAddress } from "@/utils/hedera";
import {
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Long,
  Signer,
} from "@hashgraph/sdk";
import { useState } from "react";

interface UseTokenMintResult {
  mint: (
    contractId: string,
    tokenId: number,
    recipient: string,
    amount: string,
    gasLimit?: number
  ) => Promise<void>;
  error: string | null;
  loading: boolean;
  success: boolean;
  transactionHash: string | null;
}

export const useTokenMint = (): UseTokenMintResult => {
  const { walletAddress, hashconnect } = useHashConnectContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const mint = async (
    contractId: string,
    tokenId: number,
    recipient: string,
    amount: string,
    gasLimit: number = 200_000
  ) => {
    if (!walletAddress) {
      setError("Wallet is not connected.");
      return;
    }

    setError(null);
    setLoading(true);
    setSuccess(false);
    setTransactionHash(null);

    try {
      const signer = hashconnect?.getSigner(
        AccountId.fromString(walletAddress) as any
      ) as unknown as Signer;
      const evmAddress = await accountIdToEvmAddress(recipient);
      const transaction = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(gasLimit)
        .setFunction(
          "mint",
          new ContractFunctionParameters()
            .addUint256(tokenId)
            .addAddress(evmAddress)
            .addUint256(Long.fromString(amount))
        )
        .freezeWithSigner(signer);

      const contractExecSubmit = await transaction.executeWithSigner(signer);
      const hash = contractExecSubmit.transactionId.toString();
      setTransactionHash(hash);
      setSuccess(true);
    } catch (err) {
      console.error("Failed to mint token:", err);
      const errorMessage =
        (err as Error)?.message || "An unexpected error occurred.";
      setError(`Failed to mint token: ${errorMessage}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return { mint, error, loading, success, transactionHash };
};
