import NavigationBar from "@/components/NavBar";
import { useHashConnectContext } from "@/contexts/hashconnect";
import env from "@/env";
import { useHederaTokenApproval } from "@/hooks/useHederaTokenApproval";
import { useTokenMint } from "@/hooks/useTokenMint";
import { shortenTransactionHash } from "@/utils/transaction_string";
import React, { useState } from "react";

const FaucetTokenPage: React.FC = () => {
  const { mint, error, loading, success, transactionHash } = useTokenMint();
  const { walletAddress } = useHashConnectContext();
  const [selectedToken, setSelectedToken] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");

  const {
    checkAndApproveToken,
    error: approvalError,
    loading: approvalLoading,
  } = useHederaTokenApproval();

  const contractId = "0.0.5219698";
  const tokenInfos = [
    {
      tokenId: 0,
      tokenName: "Hedera Donation Mock USD (HDM_USD)",
      tokenAccountId: "0.0.5219699",
      evmAddress: "0x00000000000000000000000000000000004fa573",
    },
    {
      tokenId: 1,
      tokenName: "Hedera Donation Mock Ethereum (HDM_ETH)",
      tokenAccountId: "0.0.5219700",
      evmAddress: "0x00000000000000000000000000000000004fa574",
    },
  ];

  const handleMint = async () => {
    if (selectedToken !== "" && walletAddress && amount) {
      const token = tokenInfos.find((t) => t.tokenId === Number(selectedToken));
      if (!token) {
        alert("Invalid token selected.");
        return;
      }

      const isApproved = await checkAndApproveToken(
        token.evmAddress || "",
        contractId,
        amount.toString()
      );

      if (isApproved) {
        console.log("Token allowance approved successfully.");
        await mint(
          contractId,
          Number(selectedToken),
          walletAddress,
          amount.toString()
        );
      } else {
        alert("Token allowance approval failed.");
      }
    } else {
      alert("Please select a token, connect your wallet, and enter an amount.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavigationBar />

      <main className="container mx-auto py-16 px-6 md:px-20">
        <h2 className="text-5xl font-bold text-blue-800 mb-12 text-center">
          Faucet Token
        </h2>

        <section className="bg-white p-10 rounded-xl shadow-lg mb-16">
          <h3 className="text-3xl font-bold text-blue-700 mb-6">
            Mint Your Tokens
          </h3>
          <div className="mb-4">
            <label className="block text-lg text-gray-700 mb-2">
              Select Token:
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a Token --</option>
              {tokenInfos.map((token) => (
                <option key={token.tokenId} value={token.tokenId}>
                  {token.tokenName} (Account: {token.tokenAccountId})
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-lg text-gray-700 mb-2">Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleMint}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            disabled={loading || approvalLoading}
          >
            {loading || approvalLoading ? "Processing..." : "Mint Tokens"}
          </button>

          {(error || approvalError) && (
            <p className="text-red-500 mt-4">{error || approvalError}</p>
          )}
          {success && transactionHash && (
            <a
              className="text-green-600 hover:underline"
              href={`${env.EXPLORER_SCAN}/transaction/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Faucet successful! Transaction Hash:{" "}
              {shortenTransactionHash(transactionHash)}
            </a>
          )}
        </section>
      </main>
    </div>
  );
};

export default FaucetTokenPage;
