import env from "@/env";
import { initializeClient } from "@/utils/hedera";
import { AccountBalanceQuery, AccountId, TokenId } from "@hashgraph/sdk";
import { useState } from "react";

interface UseTokenBalanceResult {
  getTokenBalance: (accountId: string, tokenId: string) => Promise<void>;
  balance: number | null;
  loading: boolean;
  error: string | null;
}

export const useTokenBalance = (): UseTokenBalanceResult => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenBalance = async (accountId: string, tokenId: string) => {
    setLoading(true);
    setError(null);

    try {
      const client = initializeClient(env.NETWORK);

      const accountBalance = await new AccountBalanceQuery()
        .setAccountId(AccountId.fromString(accountId))
        .execute(client);

      const tokenBalance = accountBalance?.tokens?.get(
        TokenId.fromString(tokenId)
      );

      if (tokenBalance) {
        const newBalance = tokenBalance.toNumber();
        if (newBalance !== balance) {
          setBalance(newBalance);
        }
      } else {
        setBalance(0);
        setError("Token balance not found.");
      }
    } catch (err) {
      console.error("Failed to fetch token balance:", err);
      setError((err as Error).message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return { getTokenBalance, balance, loading, error };
};
