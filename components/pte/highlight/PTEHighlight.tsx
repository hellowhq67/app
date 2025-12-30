'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PTEHighlightState, PTEHighlight } from '@/types/pte-types';

interface PTEHighlightProps {
  text: string;
  isMultiple?: boolean;
  maxHighlights?: number;
  selectedText?: string[];
  onChange?: (highlights: PTEHighlight[]) => void;
  disabled?: boolean;
  className?: string;
}

const PTEHighlight: React.FC<PTEHighlightProps> = ({
  text,
  isMultiple = false,
  maxHighlights = 1,
  selectedText = [],
  onChange,
  disabled = false,
  className = ''
}) => {
  const [highlightState, setHighlightState] = useState<PTEHighlightState>({
    selectedText,
    highlights: [],
    isMultiple,
    maxHighlights,
    isValid: true
  });

  const textRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const createHighlight = useCallback((selectedText: string, startIndex: number, endIndex: number, type: 'correct' | 'incorrect' = 'correct'): PTEHighlight => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      text: selectedText,
      startIndex,
      endIndex,
      type
    };
  }, []);

  const handleTextSelection = useCallback(() => {
    if (disabled || !textRef.current) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();
    
    if (selectedText.length === 0) return;

    const startIndex = range.startOffset;
    const endIndex = range.endOffset;

    // Check if this selection is already highlighted
    const isAlreadyHighlighted = highlightState.highlights.some(highlight =>
      highlight.startIndex <= startIndex && highlight.endIndex >= endIndex
    );

    if (isAlreadyHighlighted) return;

    // Check max highlights limit
    if (!isMultiple && highlightState.highlights.length >= maxHighlights) {
      // Remove existing highlight for single selection mode
      const newHighlights = [];
      setHighlightState(prev => ({ ...prev, highlights: newHighlights }));
      onChange?.(newHighlights);
    }

    // Add new highlight
    const newHighlight = createHighlight(selectedText, startIndex, endIndex);
    const newHighlights = isMultiple ? 
      [...highlightState.highlights, newHighlight] : 
      [newHighlight];

    setHighlightState(prev => ({
      ...prev,
      highlights: newHighlights,
      isValid: newHighlights.length <= maxHighlights
    }));

    onChange?.(newHighlights);

    // Clear selection
    selection.removeAllRanges();
  }, [disabled, highlightState.highlights, isMultiple, maxHighlights, createHighlight, onChange]);

  const removeHighlight = useCallback((highlightId: string) => {
    if (disabled) return;

    const newHighlights = highlightState.highlights.filter(h => h.id !== highlightId);
    setHighlightState(prev => ({
      ...prev,
      highlights: newHighlights,
      isValid: true
    }));

    onChange?.(newHighlights);
  }, [disabled, highlightState.highlights, onChange]);

  const clearAllHighlights = useCallback(() => {
    if (disabled) return;

    setHighlightState(prev => ({
      ...prev,
      highlights: [],
      isValid: true
    }));

    onChange?.([]);
  }, [disabled, onChange]);

  const renderHighlightedText = useCallback(() => {
    if (!text) return '';

    let result = '';
    let lastIndex = 0;

    // Sort highlights by start position
    const sortedHighlights = [...highlightState.highlights].sort((a, b) => a.startIndex - b.startIndex);

    sortedHighlights.forEach((highlight, index) => {
      // Add text before highlight
      result += text.slice(lastIndex, highlight.startIndex);
      
      // Add highlighted text
      const highlightedText = text.slice(highlight.startIndex, highlight.endIndex);
      result += `<span class="highlight highlight-${highlight.type}" data-highlight-id="${highlight.id}">${highlightedText}</span>`;
      
      lastIndex = highlight.endIndex;
    });

    // Add remaining text
    result += text.slice(lastIndex);

    return result;
  }, [text, highlightState.highlights]);

  const handleHighlightClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const highlightElement = target.closest('.highlight');
    
    if (highlightElement) {
      const highlightId = highlightElement.getAttribute('data-highlight-id');
      if (highlightId) {
        removeHighlight(highlightId);
      }
    }
  }, [removeHighlight]);

  useEffect(() => {
    const textElement = textRef.current;
    if (!textElement) return;

    // Set up selection change listener
    const handleSelectionChange = () => {
      if (isSelecting) return;
      setIsSelecting(true);
      setTimeout(() => {
        handleTextSelection();
        setIsSelecting(false);
      }, 100);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    textElement.addEventListener('click', handleHighlightClick);

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      textElement.removeEventListener('click', handleHighlightClick);
    };
  }, [handleTextSelection, handleHighlightClick, isSelecting]);

  useEffect(() => {
    // Update rendered text when highlights change
    if (textRef.current) {
      textRef.current.innerHTML = renderHighlightedText();
    }
  }, [renderHighlightedText]);

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 ${className}`}>
      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Select text to highlight it. Click on highlighted text to remove it.
          {!isMultiple && ` Select up to ${maxHighlights} item(s).`}
          {isMultiple && ` Select multiple items (no limit).`}
        </p>
      </div>

      {/* Highlight Controls */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {highlightState.highlights.length} highlight{highlightState.highlights.length !== 1 ? 's' : ''} selected
          {!isMultiple && maxHighlights && ` (max: ${maxHighlights})`}
        </div>
        
        <button
          onClick={clearAllHighlights}
          disabled={disabled || highlightState.highlights.length === 0}
          className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
            disabled || highlightState.highlights.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          Clear All
        </button>
      </div>

      {/* Text Content */}
      <div className="relative">
        <div
          ref={textRef}
          className={`text-gray-800 leading-relaxed select-text cursor-text ${
            disabled ? 'pointer-events-none opacity-50' : ''
          }`}
          style={{ 
            fontSize: '16px',
            lineHeight: '1.6'
          }}
        >
          {text}
        </div>

        {/* Highlight Styles */}
        <style jsx>{`
          .highlight {
            background-color: #fef3c7;
            border-radius: 2px;
            padding: 1px 2px;
            cursor: pointer;
            transition: all 0.2s ease;
            border-bottom: 2px solid;
          }
          
          .highlight-correct {
            background-color: #dcfce7;
            border-bottom-color: #16a34a;
          }
          
          .highlight-incorrect {
            background-color: #fef2f2;
            border-bottom-color: #dc2626;
          }
          
          .highlight:hover {
            background-color: #fde68a;
            transform: scale(1.02);
          }
          
          .highlight-correct:hover {
            background-color: #bbf7d0;
          }
          
          .highlight-incorrect:hover {
            background-color: #fecaca;
          }
        `}</style>
      </div>

      {/* Selected Highlights List */}
      {highlightState.highlights.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-medium text-gray-800 mb-2">Selected Highlights:</h4>
          <div className="space-y-2">
            {highlightState.highlights.map((highlight, index) => (
              <div
                key={highlight.id}
                className={`flex items-center justify-between p-2 rounded border ${
                  highlight.type === 'correct' 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700 mr-2">
                    {index + 1}.
                  </span>
                  <span className="text-sm text-gray-800">"{highlight.text}"</span>
                </div>
                
                <button
                  onClick={() => removeHighlight(highlight.id)}
                  disabled={disabled}
                  className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                    disabled
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Max Selection Warning */}
      {!isMultiple && maxHighlights && highlightState.highlights.length >= maxHighlights && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          Maximum number of highlights reached. Remove a highlight to select another.
        </div>
      )}

      {/* Keyboard Instructions */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
        <strong>How to highlight:</strong>
        <br />• Click and drag to select text
        <br />• Click on highlighted text to remove it
        <br />• Use "Clear All" to remove all highlights
      </div>
    </div>
  );
};

export default PTEHighlight;
