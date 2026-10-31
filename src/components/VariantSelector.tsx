'use client';

import React from 'react';
import { ProductOption, ProductVariant } from '@/types/api';

interface VariantSelectorProps {
  options: ProductOption[];
  selectedOptions: Record<string, string>;
  onOptionSelect: (optionName: string, value: string) => void;
  variants?: ProductVariant[];
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  options,
  selectedOptions,
  onOptionSelect,
}) => {
  if (!options || options.length === 0) return null;

  return (
    <div className="space-y-6 py-4 border-y border-neutral-100">
      {options.map((option) => {
        const optionName = option.name;
        const selectedVal = selectedOptions[optionName];

        return (
          <div key={option.id || optionName} className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-900 uppercase tracking-wider">
                {optionName}:
              </span>
              {selectedVal && (
                <span className="text-neutral-500 font-medium">{selectedVal}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2.5">
              {option.values.map((valObj) => {
                const valStr = valObj.value;
                const isSelected = selectedVal === valStr;

                return (
                  <button
                    key={valObj.id || valStr}
                    type="button"
                    onClick={() => onOptionSelect(optionName, valStr)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xs border transition-all ${
                      isSelected
                        ? 'border-neutral-950 bg-neutral-950 text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                    }`}
                  >
                    {valStr}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
