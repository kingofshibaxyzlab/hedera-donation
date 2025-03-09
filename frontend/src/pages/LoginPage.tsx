import { UrlMapping } from "@/commons/url-mapping.common";
import Spinner from "@/components/spinner/Spinner";
import { useHashConnectContext } from "@/contexts/hashconnect";
import { useLogin, useNonce } from "@/services/apis/auth";
import { useAuthStore } from "@/services/stores/useAuthStore";
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage: React.FC = () => {
  const { mutate: loginMutate, isPending: isLoggingIn } = useLogin();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { connectToWallet, walletAddress, signData } = useHashConnectContext();

  const { data: dataNonce, isLoading: isNonceLoading } = useNonce({
    variables: { walletAddress: walletAddress || "" },
    enabled: Boolean(walletAddress),
  });

  const handleLogin = async () => {
    const nonce = dataNonce?.nonce;
    if (!walletAddress || !nonce) {
      toast.error("Please connect your wallet first.");
      return;
    }
    const signatureArray = await sign(nonce);
    const rawSignature = signatureArray?.[0]?.signature;
    const signatureString = rawSignature ? bytesToHex(rawSignature) : "";
    loginMutate(
      { wallet_address: walletAddress, signature: signatureString },
      {
        onSuccess: async (data) => {
          try {
            login(data);
            navigate(UrlMapping.home);
          } catch (error) {
            toast.error("Error setting authentication.");
          }
        },
        onError: (error: any) => {
          toast.error(
            `Login failed: ${error.response?.data?.message || error.message}`
          );
        },
      }
    );
  };

  // Helper function to convert Uint8Array to a hex string
  function bytesToHex(uint8array: Uint8Array): string {
    return Array.from(uint8array)
      .map((byte: number) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  const prefixMessageToSign = (message: string): string => {
    return (
      "Welcome to ShibaAngels, please sign this message to login:\n" + message
    );
  };

  const sign = async (message: string) => {
    if (!walletAddress || !signData) {
      toast.error("Please connect your wallet first.");
      return;
    }
    const prefixedMessage = prefixMessageToSign(message);
    try {
      return await signData(prefixedMessage);
    } catch (error) {
      console.error("Signing failed", error);
      toast.error("Signing failed, please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 via-gray-50 to-blue-50">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-extrabold text-blue-800 mb-6 text-center">
          Welcome Back!
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Connect your HashPack Wallet to log in.
        </p>
        <button
          onClick={connectToWallet}
          className={`w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg ${
            walletAddress
              ? "bg-green-600 hover:bg-green-700"
              : "hover:bg-blue-700"
          } transition duration-300 mb-4`}
        >
          {walletAddress
            ? `Connected: ${walletAddress}`
            : "Connect HashPack Wallet"}
        </button>
        {walletAddress && dataNonce && !isNonceLoading && (
          <button
            onClick={handleLogin}
            className={`w-full bg-yellow-500 text-blue-800 py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-yellow-600 transition duration-300 ${
              isLoggingIn && "opacity-70 cursor-not-allowed"
            }`}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        )}

        <nav className="space-x-2 text-center text-sm text-yellow-600 mb-6 animate-pulse">
          Please check your wallet if you are using a phone to connect.
        </nav>

        {walletAddress && isNonceLoading && (
          <Spinner message="Loading account ..." />
        )}
        <div className="mt-4 text-center">
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate(UrlMapping.home)}
          >
            Back to home page
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
