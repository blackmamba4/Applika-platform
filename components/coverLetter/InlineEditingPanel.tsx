// components/coverLetter/InlineEditingPanel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Underline, Palette, Type, AlignLeft, AlignCenter, AlignRight, Highlighter, Save, X } from "lucide-react";
import type { ContentSection } from "@/types/coverLetter";

interface InlineEditingPanelProps {
  sectionId: string;
  section: ContentSection;
  currentValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  onUpdateSection: (updates: Partial<ContentSection>) => void;
}

export const InlineEditingPanel = ({
  sectionId,
  section,
  currentValue,
  onSave,
  onCancel,
  onUpdateSection
}: InlineEditingPanelProps) => {
  const [editValue, setEditValue] = useState(currentValue);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside the toolbar
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    // Add a small delay to prevent immediate closing when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  const handleSave = () => {
    onSave(editValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <>
      {/* Toolbar positioned relative to cover letter */}
      <div ref={toolbarRef} className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 p-3">
        <div className="flex items-center justify-between">
          {/* Left side - Formatting tools */}
          <div className="flex items-center gap-4">
            {/* Text Formatting */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateSection({ isBold: !section.isBold })}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                  section.isBold ? "bg-blue-100 text-blue-700" : "text-gray-600"
                }`}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </button>
              <button
                onClick={() => onUpdateSection({ isItalic: !section.isItalic })}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                  section.isItalic ? "bg-blue-100 text-blue-700" : "text-gray-600"
                }`}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </button>
              <button
                onClick={() => onUpdateSection({ isUnderlined: !section.isUnderlined })}
                className={`p-2 rounded hover:bg-gray-100 transition-colors ${
                  section.isUnderlined ? "bg-blue-100 text-blue-700" : "text-gray-600"
                }`}
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Font Color */}
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-500" />
              <input
                type="color"
                value={section.fontColor || '#000000'}
                onChange={(e) => onUpdateSection({ fontColor: e.target.value })}
                className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                title="Font Color"
              />
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Spacing Controls */}
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-gray-500" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Top:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={section.spacingTop || 0}
                  onChange={(e) => onUpdateSection({ spacingTop: parseInt(e.target.value) })}
                  className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-8">{section.spacingTop || 0}px</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Bottom:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={section.spacingBottom || 0}
                  onChange={(e) => onUpdateSection({ spacingBottom: parseInt(e.target.value) })}
                  className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-8">{section.spacingBottom || 0}px</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Sides:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={section.spacingSides || 0}
                  onChange={(e) => onUpdateSection({ spacingSides: parseInt(e.target.value) })}
                  className="w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-8">{section.spacingSides || 0}px</span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Text Highlighting */}
            <div className="flex items-center gap-2">
              <Highlighter className="h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={section.highlightedText || ''}
                onChange={(e) => onUpdateSection({ highlightedText: e.target.value })}
                className="px-2 py-1 border border-gray-300 rounded text-xs w-24"
                placeholder="Highlight text"
              />
              <input
                type="color"
                value={section.highlightColor || '#ffff00'}
                onChange={(e) => onUpdateSection({ highlightColor: e.target.value })}
                className="w-6 h-6 border border-gray-300 rounded cursor-pointer"
                title="Highlight Color"
              />
            </div>
          </div>

          {/* Right side - Close button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
