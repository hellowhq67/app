'use client';

import React, { useState, useCallback, useRef } from 'react';
import { PTEDragDropState, PTEDragItem, PTEDropZone } from '@/types/pte-types';

interface PTEDragDropProps {
  items: PTEDragItem[];
  dropZones: PTEDropZone[];
  onReorder?: (newOrder: PTEDragItem[]) => void;
  onDrop?: (zoneId: string, items: PTEDragItem[]) => void;
  disabled?: boolean;
  className?: string;
  showReset?: boolean;
}

const PTEDragDrop: React.FC<PTEDragDropProps> = ({
  items,
  dropZones,
  onReorder,
  onDrop,
  disabled = false,
  className = '',
  showReset = true
}) => {
  const [dragDropState, setDragDropState] = useState<PTEDragDropState>({
    items,
    droppedItems: [],
    isDragging: false,
    draggedItem: undefined,
    dropZones
  });

  const draggedItemRef = useRef<PTEDragItem | null>(null);
  const draggedOverRef = useRef<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, item: PTEDragItem) => {
    if (disabled) return;

    draggedItemRef.current = item;
    setDragDropState(prev => ({ ...prev, isDragging: true, draggedItem: item }));
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    
    // Add visual feedback
    e.target.classList.add('opacity-50');
  }, [disabled]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDragDropState(prev => ({ ...prev, isDragging: false, draggedItem: undefined }));
    draggedItemRef.current = null;
    draggedOverRef.current = null;
    
    // Remove visual feedback
    e.target.classList.remove('opacity-50');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, [disabled]);

  const handleDragEnter = useCallback((e: React.DragEvent, zoneId?: string) => {
    if (disabled) return;
    
    e.preventDefault();
    draggedOverRef.current = zoneId || null;
    
    // Add visual feedback for drop zone
    if (zoneId) {
      e.currentTarget.classList.add('bg-blue-100', 'border-blue-400');
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    draggedOverRef.current = null;
    
    // Remove visual feedback
    e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent, targetZone?: PTEDropZone) => {
    if (disabled || !draggedItemRef.current) return;

    e.preventDefault();
    e.stopPropagation();

    const draggedItem = draggedItemRef.current;
    
    // Remove visual feedback
    e.currentTarget.classList.remove('bg-blue-100', 'border-blue-400');

    if (targetZone) {
      // Drop into zone
      const newItems = [...targetZone.items, draggedItem];
      const updatedZones = dragDropState.dropZones.map(zone =>
        zone.id === targetZone.id ? { ...zone, items: newItems } : zone
      );

      setDragDropState(prev => ({
        ...prev,
        dropZones: updatedZones,
        droppedItems: [...prev.droppedItems, draggedItem]
      }));

      onDrop?.(targetZone.id, newItems);
    } else {
      // Reorder within same list
      const draggedIndex = dragDropState.items.findIndex(item => item.id === draggedItem.id);
      if (draggedIndex === -1) return;

      const newItems = [...dragDropState.items];
      newItems.splice(draggedIndex, 1);
      
      // Find the drop position
      const dropTarget = e.target as HTMLElement;
      const dropElement = dropTarget.closest('[data-drag-item]');
      if (dropElement) {
        const dropIndex = parseInt(dropElement.getAttribute('data-index') || '0');
        newItems.splice(dropIndex, 0, draggedItem);
      }

      setDragDropState(prev => ({ ...prev, items: newItems }));
      onReorder?.(newItems);
    }

    draggedItemRef.current = null;
    setDragDropState(prev => ({ ...prev, isDragging: false, draggedItem: undefined }));
  }, [disabled, dragDropState.items, dragDropState.dropZones, onDrop, onReorder]);

  const handleReset = useCallback(() => {
    if (disabled) return;

    setDragDropState({
      items,
      droppedItems: [],
      isDragging: false,
      draggedItem: undefined,
      dropZones
    });

    onReorder?.(items);
    onDrop?.('', []);
  }, [disabled, items, onReorder, onDrop]);

  const isItemDropped = useCallback((itemId: string): boolean => {
    return dragDropState.droppedItems.some(item => item.id === itemId);
  }, [dragDropState.droppedItems]);

  return (
    <div className={`bg-white border border-gray-300 rounded-lg p-4 ${className}`}>
      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Drag and drop items to reorder them or place them in the correct zones.
        </p>
      </div>

      {/* Reset Button */}
      {showReset && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={handleReset}
            disabled={disabled}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              disabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Reset
          </button>
        </div>
      )}

      {/* Draggable Items */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-800 mb-3">Items to Arrange</h4>
        <div className="space-y-2">
          {dragDropState.items.map((item, index) => {
            const isDropped = isItemDropped(item.id);
            
            return (
              <div
                key={item.id}
                data-drag-item
                data-index={index}
                draggable={!disabled && !isDropped}
                onDragStart={(e) => handleDragStart(e, item)}
                onDragEnd={handleDragEnd}
                className={`p-3 border border-gray-300 rounded-lg cursor-move transition-all ${
                  isDropped 
                    ? 'opacity-30 cursor-not-allowed bg-gray-100' 
                    : 'bg-white hover:border-blue-400 hover:shadow-md'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center">
                  <div className="mr-2 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <span className="text-gray-800">{item.content}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drop Zones */}
      {dropZones.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-3">Drop Zones</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dropZones.map((zone) => (
              <div
                key={zone.id}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, zone)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, zone)}
                className={`min-h-24 p-4 border-2 border-dashed rounded-lg transition-all ${
                  zone.items.length > 0
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 bg-gray-50'
                } ${disabled ? 'cursor-not-allowed' : ''}`}
              >
                <div className="text-sm font-medium text-gray-700 mb-2">
                  {zone.id.replace('_', ' ').toUpperCase()}
                </div>
                
                {zone.items.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">📥</div>
                    <p>Drop items here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {zone.items.map((item, index) => (
                      <div
                        key={item.id}
                        data-drag-item
                        data-index={index}
                        draggable={!disabled}
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e)}
                        className={`p-2 bg-white border border-gray-300 rounded cursor-move ${
                          disabled ? 'cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="mr-2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </div>
                          <span className="text-gray-800">{item.content}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            ))}
          </div>
        </div>
      )}

      {/* Dragging Overlay */}
      {dragDropState.isDragging && (
        <div className="fixed inset-0 bg-blue-500 bg-opacity-10 pointer-events-none z-50">
          <div className="flex items-center justify-center h-full">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Dragging in progress...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTEDragDrop;
