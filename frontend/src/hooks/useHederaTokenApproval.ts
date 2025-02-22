import { useHashConnectContext } from "@/contexts/hashconnect";
import env from "@/env";
import {
  AccountAllowanceApproveTransaction,
  AccountId,
  Long,
  TokenAssociateTransaction,
  TokenId,
} from "@hashgraph/sdk";
import { Signer } from "@hashgraph/sdk/lib/Signer";
import axios from "axios";
import { useState } from "react";

interface UseHederaTokenApprovalResult {
  checkAndApproveToken: (
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ) => Promise<boolean>;
  error: string | null;
  loading: boolean;
}

export const useHederaTokenApproval = (): UseHederaTokenApprovalResult => {
  const { walletAddress, hashconnect } = useHashConnectContext();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const checkAndApproveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<boolean> => {
    if (!walletAddress) {
      setError("Wallet is not connected.");
      return false;
    }

    setError(null);
    setLoading(true);

    try {
      const tokenId = TokenId.fromSolidityAddress(tokenAddress);
      const ownerAccountId = AccountId.fromString(walletAddress);
      const spenderAccountId = AccountId.fromString(spenderAddress);

      const signer = hashconnect?.getSigner(
        ownerAccountId as any
      ) as unknown as Signer;

      // Check if the token is associated with the owner's account
      const isAssociated = await checkTokenAssociation(walletAddress, tokenId);
      if (!isAssociated) {
        await associateToken(signer, ownerAccountId, tokenId);
      }

      // Check if the spender has sufficient allowance
      const isApproved = await checkTokenAllowance(
        walletAddress,
        tokenId,
        spenderAccountId,
        amount
      );
      if (isApproved) {
        console.log("Token allowance is already sufficient.");
        return true;
      }

      // Approve the spender to use the specified amount of tokens
      await approveTokenAllowance(
        signer,
        tokenId,
        ownerAccountId,
        spenderAccountId,
        amount
      );
      return true;
    } catch (err) {
      console.error("Token approval failed:", err);
      setError((err as Error).message || "Failed to approve token.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const checkTokenAssociation = async (
    accountId: string,
    tokenId: TokenId
  ): Promise<boolean> => {
    const associateUrl = `${env.MIRROR_NODE}/api/v1/accounts/${accountId}/tokens?limit=1000000`;
    const { data } = await axios.get(associateUrl);
    return data.tokens?.some(
      (token: any) => token.token_id === tokenId.toString()
    );
  };

  const associateToken = async (
    signer: Signer,
    ownerAccountId: AccountId,
    tokenId: TokenId
  ): Promise<void> => {
    const transaction = await new TokenAssociateTransaction()
      .setAccountId(ownerAccountId)
      .setTokenIds([tokenId])
      .freezeWithSigner(signer);

    const response = await transaction.executeWithSigner(signer);
    console.log(
      "Token association transaction ID:",
      response.transactionId.toString()
    );
  };

  const checkTokenAllowance = async (
    accountId: string,
    tokenId: TokenId,
    spenderAccountId: AccountId,
    amount: string
  ): Promise<boolean> => {
    const allowanceUrl = `${env.MIRROR_NODE}/api/v1/accounts/${accountId}/allowances/tokens?limit=1000000`;
    const { data } = await axios.get(allowanceUrl);
    console.log(
      "checkTokenAllowance: ",
      tokenId.toString(),
      spenderAccountId.toString()
    );
    return data.allowances?.some(
      (allowance: any) =>
        allowance.token_id === tokenId.toString() &&
        allowance.spender === spenderAccountId.toString() &&
        BigInt(allowance.amount_granted) >= BigInt(amount)
    );
  };

  const approveTokenAllowance = async (
    signer: Signer,
    tokenId: TokenId,
    ownerAccountId: AccountId,
    spenderAccountId: AccountId,
    amount: string
  ): Promise<void> => {
    const transaction = await new AccountAllowanceApproveTransaction()
      .approveTokenAllowance(
        tokenId,
        ownerAccountId,
        spenderAccountId,
        Long.fromString(amount)
      )
      .freezeWithSigner(signer);

    const response = await transaction.executeWithSigner(signer);
    console.log(
      "Token approval transaction ID:",
      response.transactionId.toString()
    );
  };

  return { checkAndApproveToken, error, loading };
};
