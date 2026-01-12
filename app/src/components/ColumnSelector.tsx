"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Checkbox from "./Checkbox";

export interface ColumnConfig {
  label: string;
  accessor: string;
  visible: boolean;
  order: number;
  width?: string;
}

interface ColumnSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  onToggleColumn: (accessor: string) => void;
  onResetToDefault?: () => void;
  title?: string;
  description?: string;
  localStorageKey?: string;
  excludeAccessors?: string[]; // Columns to exclude from the selector (e.g., select checkbox)
}

export default function ColumnSelector({
  isOpen,
  onClose,
  columns,
  onToggleColumn,
  onResetToDefault,
  title = "Column Settings",
  description = "Show or hide columns to customize your view. Your preferences will be saved.",
  excludeAccessors = ["_id"],
}: ColumnSelectorProps) {
  const visibleColumns = columns.filter(
    (col) => !excludeAccessors.includes(col.accessor)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Invisible overlay for outside click */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Popup Modal - Right Center */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed top-0 right-0 h-full z-50 flex items-center justify-end p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col border border-gray-200/50 pointer-events-auto"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                <motion.h3
                  className="text-xl font-semibold text-gray-900"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h3>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100/80 rounded-lg transition-colors"
                  title="Close"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <motion.p
                  className="text-sm text-gray-600 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {description}
                </motion.p>
                <div className="space-y-2">
                  {visibleColumns.map((column, index) => (
                    <motion.div
                      key={column.accessor}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      className="px-4 py-3 hover:bg-gray-50/80 rounded-lg transition-all duration-200 group"
                      whileHover={{ x: 4 }}
                    >
                      <Checkbox
                        id={`column-${column.accessor}`}
                        checked={column.visible}
                        onChange={() => onToggleColumn(column.accessor)}
                        label={column.label}
                        labelClassName="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors"
                        containerClassName="cursor-pointer"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              {onResetToDefault && (
                <div className="p-6 border-t border-gray-200/50">
                  <motion.button
                    onClick={onResetToDefault}
                    className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Reset to Default
                  </motion.button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
