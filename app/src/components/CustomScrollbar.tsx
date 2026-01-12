import React from "react";

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxHeight?: string | number;
  minHeight?: string | number;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  children,
  className = "",
  style = {},
  maxHeight,
  minHeight,
}) => {
  const scrollbarStyle: React.CSSProperties = {
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "#94a3b8 #f8fafc",
    ...style,
  };

  if (maxHeight) {
    scrollbarStyle.maxHeight = maxHeight;
  }

  if (minHeight) {
    scrollbarStyle.minHeight = minHeight;
  }

  return (
    <div className={`custom-scrollbar ${className}`} style={scrollbarStyle}>
      {children}
    </div>
  );
};

export default CustomScrollbar;
