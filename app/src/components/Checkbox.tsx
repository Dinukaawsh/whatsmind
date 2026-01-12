"use client";

import { forwardRef } from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelClassName?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      labelClassName = "",
      containerClassName = "",
      className = "",
      ...props
    },
    ref
  ) => {
    const checkboxClass = `appearance-none w-5 h-5 border-2 border-gray-300 rounded-md transition duration-150 bg-white checked:bg-[#05112b] checked:border-[#beb7c9] relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-sm checked:after:font-bold checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 focus:outline-none focus:ring-2 focus:ring-[#beb7c9] focus:ring-opacity-50 cursor-pointer transform transition-transform duration-200 ease-in-out checked:scale-75 ${className}`;

    if (label) {
      const inputId =
        props.id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
      const { id, ...inputProps } = props;
      return (
        <div className={`flex items-center ${containerClassName}`}>
          <input
            type="checkbox"
            ref={ref}
            id={inputId}
            className={checkboxClass}
            {...inputProps}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={`ml-3 cursor-pointer ${labelClassName}`}
            >
              {label}
            </label>
          )}
        </div>
      );
    }

    return (
      <input type="checkbox" ref={ref} className={checkboxClass} {...props} />
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
