import React from "react";

const Spinner: React.FC<{ message?: string }> = ({
  message = "Loading...",
}) => {
  return (
    <div className="flex items-center justify-center py-3">
      <svg
        className="animate-spin h-6 w-6 text-blue-800 mr-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="text-blue-800 font-medium">{message}</span>
    </div>
  );
};

export default Spinner;
