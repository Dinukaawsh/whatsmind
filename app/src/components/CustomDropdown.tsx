import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import CustomScrollbar from "./CustomScrollbar";

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
  [key: string]: any; // Allow additional properties
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  className?: string;
  maxHeight?: number;
  allowSearch?: boolean;
  allowClear?: boolean;
  clearText?: string;
  noOptionsText?: string;
  loadingText?: string;
  emptyStateText?: string;
  renderOption?: (option: DropdownOption) => React.ReactNode;
  renderSelectedValue?: (option: DropdownOption | null) => React.ReactNode;
  // External control props
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  // Placement prop
  placement?: "bottom" | "top";
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  searchPlaceholder = "Search...",
  disabled = false,
  loading = false,
  error = false,
  className = "",
  maxHeight = 200,
  allowSearch = true,
  allowClear = true,
  clearText = "Select option",
  noOptionsText = "No options found",
  loadingText = "Loading...",
  emptyStateText = "No options available",
  renderOption,
  renderSelectedValue,
  isOpen: externalIsOpen,
  onOpenChange,
  placement = "bottom",
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalIsOpen(value);
    }
  };
  const [searchValue, setSearchValue] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        setIsOpen(false);
        setSearchValue("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on search
  const filteredOptions =
    allowSearch && searchValue
      ? options.filter((option) =>
          option.label.toLowerCase().includes(searchValue.toLowerCase())
        )
      : options;

  // Find selected option
  const selectedOption =
    options.find((option) => option.value === value) || null;

  // Handle option selection
  const handleOptionSelect = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(optionValue);
    setIsOpen(false);
    setSearchValue("");
  };

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setIsOpen(false);
    setSearchValue("");
  };

  // Determine display text and styling
  const isPlaceholder = loading || !selectedOption;
  const displayText = loading
    ? loadingText
    : selectedOption
    ? renderSelectedValue
      ? renderSelectedValue(selectedOption)
      : selectedOption.label
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`${
          className?.includes("w-") ? className : "w-full"
        } px-3 py-2 border rounded-md bg-white focus-within:ring-2 focus-within:ring-[#e9e8ff] cursor-pointer select-none min-w-0 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""}`}
        onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <span
            className={`truncate ${
              isPlaceholder ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {displayText}
          </span>
          <span className="pointer-events-none">
            <ChevronDown className="text-gray-400" />
          </span>
        </div>
        {isOpen && !disabled && !loading && (
          <div
            className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 ${
              placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
            }`}
            style={{
              minWidth: 250,
              maxHeight: maxHeight + 100, // Account for search input
            }}
          >
            {/* Search input */}
            {allowSearch && (
              <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#e9e8ff]"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}

            {/* Scrollable options list */}
            <CustomScrollbar maxHeight={maxHeight}>
              {/* Clear option */}
              {allowClear && (
                <div
                  className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-black ${
                    !value ? "font-bold" : ""
                  }`}
                  onClick={(e) => handleClear(e)}
                >
                  {clearText}
                </div>
              )}

              {/* Options */}
              {filteredOptions.length === 0 && searchValue ? (
                <div className="px-3 py-2 text-black text-sm">
                  {noOptionsText}
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-black text-sm">
                  {emptyStateText}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-black ${
                      value === option.value ? "font-bold" : ""
                    } ${
                      option.disabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={(e) =>
                      !option.disabled && handleOptionSelect(option.value, e)
                    }
                  >
                    {renderOption ? renderOption(option) : option.label}
                  </div>
                ))
              )}
            </CustomScrollbar>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
