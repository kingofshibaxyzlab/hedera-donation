import { useAuthStore } from "@/services/stores/useAuthStore";
import { AccountId, LedgerId, Transaction } from "@hashgraph/sdk";
import {
  HashConnect,
  HashConnectConnectionState,
  SessionData,
} from "hashconnect";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface HashConnectContextType {
  hashconnect: HashConnect | null;
  pairingString: string;
  pairingData: SessionData | null;
  connectionState: HashConnectConnectionState;
  walletAddress: string | null;
  connectToWallet: () => void;
  disconnectWallet: () => void;
  sendTransaction: (
    accountId: AccountId,
    transaction: Transaction
  ) => Promise<any>;
}

const HashConnectContext = createContext<HashConnectContextType | undefined>(
  undefined
);

const appMetadata = {
  name: "Hedera Donation",
  description: "Hedera donation app",
  icons: ["https://donation.kingofshiba.xyz/favicon.ico"],
  url: "https://donation.kingofshiba.xyz",
};

const PROJECT_ID = "c611507a309f2ac32d59eafd139ae365";

export const HashConnectProvider = ({ children }: { children: ReactNode }) => {
  const hashconnectRef = useRef<HashConnect | null>(null);
  const [pairingString, setPairingString] = useState<string>("");
  const [pairingData, setPairingData] = useState<SessionData | null>(null);
  const [connectionState, setConnectionState] =
    useState<HashConnectConnectionState>(
      HashConnectConnectionState.Disconnected
    );
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const { logout } = useAuthStore();

  const initializeHashConnect = async () => {
    if (hashconnectRef.current) {
      console.warn("HashConnect is already initialized.");
      return;
    }

    try {
      const hashconnectInstance = new HashConnect(
        LedgerId.TESTNET,
        PROJECT_ID,
        appMetadata,
        false
      );
      hashconnectRef.current = hashconnectInstance;

      // Define event listeners
      const handlePairing = (newPairing: SessionData) => {
        console.log("Wallet paired:", newPairing);
        setPairingData(newPairing);

        // Set wallet address (first account in accountIds)
        if (newPairing.accountIds && newPairing.accountIds.length > 0) {
          setWalletAddress(newPairing.accountIds[0]);
        } else {
          logout();
        }
      };

      const handleDisconnection = () => {
        console.log("Wallet disconnected");
        setPairingData(null);
        setWalletAddress(null);
        setConnectionState(HashConnectConnectionState.Disconnected);
      };

      const handleConnectionStatusChange = (
        status: HashConnectConnectionState
      ) => {
        console.log("Connection status changed:", status);
        setConnectionState(status);
      };

      // Register event listeners
      hashconnectInstance.pairingEvent.on(handlePairing);
      hashconnectInstance.disconnectionEvent.on(handleDisconnection);
      hashconnectInstance.connectionStatusChangeEvent.on(
        handleConnectionStatusChange
      );

      // Initialize HashConnect
      await hashconnectInstance.init();

      return () => {
        // Clean up event listeners
        hashconnectInstance.pairingEvent.off(handlePairing);
        hashconnectInstance.disconnectionEvent.off(handleDisconnection);
        hashconnectInstance.connectionStatusChangeEvent.off(
          handleConnectionStatusChange
        );
        hashconnectRef.current = null;
      };
    } catch (error) {
      console.error("Error initializing HashConnect:", error);
      logout();
    }
  };

  const connectToWallet = async () => {
    if (!hashconnectRef.current) {
      await initializeHashConnect();
    }

    if (!hashconnectRef.current) {
      console.error("HashConnect is not initialized");
      return;
    }

    try {
      setTimeout(async () => {
        try {
          const pairingCode = await hashconnectRef.current!.openPairingModal();
          setPairingString(pairingCode as any);
          console.log("Pairing successful:", pairingCode);
        } catch (error) {
          console.error("Error during wallet pairing:", error);
        }
      }, 500);
    } catch (error) {
      console.error("Unexpected error during wallet connection:", error);
    }
  };

  const disconnectWallet = async () => {
    const hashconnect = hashconnectRef.current;
    if (hashconnect) {
      await hashconnect.disconnect();
      setPairingData(null);
      setWalletAddress(null);
    }
  };

  const sendTransaction = async (
    accountId: AccountId,
    transaction: Transaction
  ) => {
    const hashconnect = hashconnectRef.current;
    if (!hashconnect) {
      console.error("HashConnect is not initialized");
      return;
    }
    try {
      const response = await hashconnect.sendTransaction(
        accountId as any,
        transaction as any
      );
      console.log("Transaction successful:", response);
      return response;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    initializeHashConnect();
    return () => {
      disconnectWallet();
    };
  }, []);
  return (
    <HashConnectContext.Provider
      value={{
        hashconnect: hashconnectRef.current,
        pairingString,
        pairingData,
        connectionState,
        walletAddress,
        connectToWallet,
        disconnectWallet,
        sendTransaction,
      }}
    >
      {children}
    </HashConnectContext.Provider>
  );
};

export const useHashConnectContext = () => {
  const context = useContext(HashConnectContext);
  if (!context) {
    throw new Error(
      "useHashConnectContext must be used within a HashConnectProvider"
    );
  }
  return context;
};
