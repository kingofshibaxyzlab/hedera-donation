import React from "react";

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  children?: React.ReactNode;
  text?: string;
  loadingText?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  children,
  disabled,
  text = "Submit",
  loadingText = "Updating",
  ...rest
}) => {
  return (
    <div className="text-center">
      <button
        disabled={isLoading || disabled}
        {...rest}
        className={`bg-blue-600 text-white py-3 px-8 rounded-full font-semibold shadow-lg transition-all duration-300 ${
          isLoading || disabled
            ? "opacity-70 cursor-not-allowed"
            : "hover:bg-blue-700 hover:shadow-xl"
        } ${rest.className || ""}`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
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
            <span>{loadingText}</span>
          </div>
        ) : (
          children || text
        )}
      </button>
    </div>
  );
};

export default SubmitButton;
