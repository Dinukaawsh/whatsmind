"use client";

import { forwardRef } from "react";

interface InputBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  clearButton?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

const InputBox = forwardRef<HTMLInputElement, InputBoxProps>(
  (
    {
      icon,
      clearButton = false,
      onClear,
      containerClassName = "",
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`relative ${containerClassName}`}>
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md placeholder-[#A0A0A0] hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-[#e9e8ff] min-w-0 text-ellipsis text-black ${
            icon ? "pl-10" : ""
          } ${clearButton && props.value ? "pr-10" : "pr-24"} ${className}`}
          {...props}
        />
        {clearButton && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Clear"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);

InputBox.displayName = "InputBox";

export default InputBox;
