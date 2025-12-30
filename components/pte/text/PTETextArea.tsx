'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PTETextState } from '@/types/pte-types';

interface PTETextAreaProps {
  placeholder?: string;
  value?: string;
  onChange?: (text: string) => void;
  onSave?: (text: string) => void;
  wordCount?: {
    min?: number;
    max?: number;
    target?: number;
  };
  characterLimit?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
  disabled?: boolean;
  className?: string;
  showWordCount?: boolean;
  showCharCount?: boolean;
}

const PTETextArea: React.FC<PTETextAreaProps> = ({
  placeholder = 'Type your response here...',
  value = '',
  onChange,
  onSave,
  wordCount,
  characterLimit,
  autoSave = true,
  autoSaveInterval = 30000, // 30 seconds
  disabled = false,
  className = '',
  showWordCount = true,
  showCharCount = false
}) => {
  const [textState, setTextState] = useState<PTETextState>({
    text: value,
    wordCount: 0,
    characterCount: 0,
    isValid: true,
    lastSaved: Date.now(),
    isDirty: false
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  const countWords = useCallback((text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  const countCharacters = useCallback((text: string): number => {
    return text.length;
  }, []);

  const validateText = useCallback((text: string): boolean => {
    if (wordCount) {
      if (wordCount.min && countWords(text) < wordCount.min) {
        return false;
      }
      if (wordCount.max && countWords(text) > wordCount.max) {
        return false;
      }
    }
    if (characterLimit && countCharacters(text) > characterLimit) {
      return false;
    }
    return true;
  }, [wordCount, characterLimit, countWords, countCharacters]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    const words = countWords(newText);
    const chars = countCharacters(newText);
    const isValid = validateText(newText);

    setTextState({
      text: newText,
      wordCount: words,
      characterCount: chars,
      isValid,
      lastSaved: textState.lastSaved,
      isDirty: true
    });

    onChange?.(newText);
  }, [countWords, countCharacters, validateText, onChange, textState.lastSaved]);

  const saveText = useCallback(() => {
    if (!textState.isDirty || !textState.isValid) return;

    setSaveStatus('saving');
    
    try {
      onSave?.(textState.text);
      setTextState(prev => ({
        ...prev,
        lastSaved: Date.now(),
        isDirty: false
      }));
      setSaveStatus('saved');
      
      // Clear saved status after 2 seconds
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      console.error('Save failed:', error);
    }
  }, [textState, onSave]);

  // Auto-save effect
  useEffect(() => {
    if (!autoSave || !onSave) return;

    const interval = setInterval(() => {
      if (textState.isDirty && textState.isValid) {
        saveText();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, textState.isDirty, textState.isValid, saveText, onSave]);

  // Update state when value prop changes
  useEffect(() => {
    setTextState(prev => ({
      ...prev,
      text: value,
      wordCount: countWords(value),
      characterCount: countCharacters(value),
      isValid: validateText(value)
    }));
  }, [value, countWords, countCharacters, validateText]);

  const getWordCountColor = useCallback((): string => {
    if (!wordCount) return 'text-gray-600';
    
    if (textState.wordCount < (wordCount.min || 0)) {
      return 'text-red-600';
    }
    if (wordCount.max && textState.wordCount > wordCount.max) {
      return 'text-red-600';
    }
    if (wordCount.target && textState.wordCount >= wordCount.target) {
      return 'text-green-600';
    }
    return 'text-gray-600';
  }, [textState.wordCount, wordCount]);

  const getCharCountColor = useCallback((): string => {
    if (!characterLimit) return 'text-gray-600';
    
    const percentage = (textState.characterCount / characterLimit) * 100;
    if (percentage >= 90) {
      return 'text-red-600';
    }
    if (percentage >= 75) {
      return 'text-yellow-600';
    }
    return 'text-gray-600';
  }, [textState.characterCount, characterLimit]);

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 ${className}`}>
      {/* Save Status */}
      {saveStatus && (
        <div className={`mb-3 p-2 rounded text-sm ${
          saveStatus === 'saved' ? 'bg-green-50 text-green-800 border-green-200' :
          saveStatus === 'saving' ? 'bg-blue-50 text-blue-800 border-blue-200' :
          'bg-red-50 text-red-800 border-red-200'
        }`}>
          {saveStatus === 'saved' && '✓ Saved'}
          {saveStatus === 'saving' && 'Saving...'}
          {saveStatus === 'error' && '✗ Save failed'}
        </div>
      )}

      {/* Text Area */}
      <textarea
        value={textState.text}
        onChange={handleTextChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
        } ${
          !textState.isValid ? 'border-red-300' : ''
        }`}
        rows={8}
        style={{ minHeight: '200px' }}
      />

      {/* Word Count */}
      {showWordCount && wordCount && (
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-600">Words: </span>
            <span className={`font-medium ${getWordCountColor()}`}>
              {textState.wordCount}
            </span>
            {wordCount.min && (
              <span className="text-gray-500">
                {' '} (min: {wordCount.min})
              </span>
            )}
            {wordCount.max && (
              <span className="text-gray-500">
                {' '} (max: {wordCount.max})
              </span>
            )}
            {wordCount.target && (
              <span className="text-green-600 ml-2">
                Target: {wordCount.target}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Character Count */}
      {showCharCount && characterLimit && (
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm">
            <span className="text-gray-600">Characters: </span>
            <span className={`font-medium ${getCharCountColor()}`}>
              {textState.characterCount}
            </span>
            <span className="text-gray-500">
              {' '} / {characterLimit}
            </span>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                (textState.characterCount / characterLimit) >= 0.9 ? 'bg-red-500' :
                (textState.characterCount / characterLimit) >= 0.75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, (textState.characterCount / characterLimit) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Messages */}
      {!textState.isValid && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {wordCount && textState.wordCount < (wordCount.min || 0) && (
            <div>• Minimum {wordCount.min} words required</div>
          )}
          {wordCount && wordCount.max && textState.wordCount > wordCount.max && (
            <div>• Maximum {wordCount.max} words allowed</div>
          )}
          {characterLimit && textState.characterCount > characterLimit && (
            <div>• Character limit exceeded ({characterLimit} max)</div>
          )}
        </div>
      )}

      {/* Auto-save Indicator */}
      {autoSave && (
        <div className="mt-2 text-xs text-gray-500">
          {textState.isDirty ? 'Unsaved changes' : `Last saved: ${new Date(textState.lastSaved).toLocaleTimeString()}`}
        </div>
      )}

      {/* Manual Save Button */}
      {onSave && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={saveText}
            disabled={!textState.isDirty || !textState.isValid || saveStatus === 'saving'}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              !textState.isDirty || !textState.isValid || saveStatus === 'saving'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Now'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PTETextArea;
