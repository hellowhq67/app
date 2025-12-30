'use client';

import React, { useState, useCallback } from 'react';
import { PTEOption, PTEMCQState } from '@/types/pte-types';

interface PTEMultipleChoiceProps {
  options: PTEOption[];
  question?: string;
  isMultiple?: boolean;
  maxSelections?: number;
  selectedOptions?: string[];
  onChange?: (selectedIds: string[]) => void;
  disabled?: boolean;
  className?: string;
}

const PTEMultipleChoice: React.FC<PTEMultipleChoiceProps> = ({
  options,
  question,
  isMultiple = false,
  maxSelections,
  selectedOptions = [],
  onChange,
  disabled = false,
  className = ''
}) => {
  const [mcqState, setMcqState] = useState<PTEMCQState>({
    selectedOptions,
    isMultiple,
    maxSelections,
    isValid: true
  });

  const handleOptionChange = useCallback((optionId: string, isChecked: boolean) => {
    if (disabled) return;

    let newSelections: string[];

    if (isMultiple) {
      // Multiple choice logic
      if (isChecked) {
        newSelections = [...mcqState.selectedOptions, optionId];
      } else {
        newSelections = mcqState.selectedOptions.filter(id => id !== optionId);
      }

      // Enforce max selections
      if (maxSelections && newSelections.length > maxSelections) {
        newSelections = newSelections.slice(0, maxSelections);
      }
    } else {
      // Single choice logic
      newSelections = isChecked ? [optionId] : [];
    }

    const isValid = isMultiple ? 
      (maxSelections ? newSelections.length <= maxSelections : true) :
      newSelections.length <= 1;

    setMcqState({
      selectedOptions: newSelections,
      isMultiple,
      maxSelections,
      isValid
    });

    onChange?.(newSelections);
  }, [disabled, isMultiple, maxSelections, mcqState.selectedOptions, onChange]);

  const handleSingleSelect = useCallback((optionId: string) => {
    if (disabled) return;

    const newSelections = [optionId];
    
    setMcqState({
      selectedOptions: newSelections,
      isMultiple,
      maxSelections,
      isValid: true
    });

    onChange?.(newSelections);
  }, [disabled, isMultiple, onChange]);

  const clearSelection = useCallback(() => {
    if (disabled) return;

    setMcqState({
      selectedOptions: [],
      isMultiple,
      maxSelections,
      isValid: true
    });

    onChange?.([]);
  }, [disabled, onChange]);

  const canSelectMore = isMultiple && maxSelections ? 
    mcqState.selectedOptions.length < maxSelections : true;

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 ${className}`}>
      {/* Question */}
      {question && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">{question}</h3>
          {isMultiple && maxSelections && (
            <div className="text-sm text-gray-600">
              Select up to {maxSelections} options 
              ({mcqState.selectedOptions.length} selected)
            </div>
          )}
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = mcqState.selectedOptions.includes(option.id);
          const optionLabel = String.fromCharCode(65 + index); // A, B, C, D...

          return (
            <div
              key={option.id}
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={() => isMultiple ? 
                handleOptionChange(option.id, !isSelected) : 
                handleSingleSelect(option.id)
              }
            >
              {/* Selection Indicator */}
              <div className="mr-3 mt-1">
                {isMultiple ? (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                ) : (
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => {}}
                    disabled={disabled}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                )}
              </div>

              {/* Option Label */}
              <div className="flex-1">
                <span className="font-medium text-gray-700 mr-2">
                  {optionLabel}.
                </span>
                <span className="text-gray-800">{option.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selection Counter */}
      {isMultiple && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {mcqState.selectedOptions.length} option{mcqState.selectedOptions.length !== 1 ? 's' : ''} selected
            {maxSelections && ` (max: ${maxSelections})`}
          </div>
          
          <button
            onClick={clearSelection}
            disabled={disabled || mcqState.selectedOptions.length === 0}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              disabled || mcqState.selectedOptions.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Max Selection Warning */}
      {isMultiple && maxSelections && mcqState.selectedOptions.length >= maxSelections && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Maximum number of selections reached. Deselect an option to choose another.
        </div>
      )}

      {/* Keyboard Navigation Instructions */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
        <strong>Keyboard Navigation:</strong>
        <br />• Use Tab to navigate between options
        <br />• Use Space or Enter to select/deselect
        <br />• Use arrow keys for radio button navigation
      </div>
    </div>
  );
};

export default PTEMultipleChoice;
