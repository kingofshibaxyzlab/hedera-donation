import React from "react";
import Spinner from "@/components/spinner/Spinner";

interface DataLoaderProps {
  isLoading: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
  minHeight?: number;
}

const DataLoader: React.FC<DataLoaderProps> = ({
  isLoading,
  loadingMessage = "Loading...",
  children,
  minHeight = 100,
}) => {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: `${minHeight}px` }}
      >
        <Spinner message={loadingMessage} />
      </div>
    );
  }
  return <>{children}</>;
};

export default DataLoader;
