// components/coverLetter/InlineEditingPanel.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Underline, Palette, Type, X } from "lucide-react";
import type { ContentSection } from "@/types/coverLetter";
import { useColorSystem } from "@/lib/hooks/useColorSystem";

interface InlineEditingPanelProps {
  sectionId: string;
  section: ContentSection;
  currentValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  onUpdateSection: (updates: Partial<ContentSection>) => void;
  templateType?: string;
  meta?: any; // CoverLetterMeta - for color system
  contentSections?: ContentSection[]; // For color system
}

export const InlineEditingPanel = ({
  sectionId,
  section,
  currentValue,
  onSave,
  onCancel,
  onUpdateSection,
  templateType,
  meta,
  contentSections = []
}: InlineEditingPanelProps) => {
  const [editValue, setEditValue] = useState(currentValue);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditValue(currentValue);
  }, [currentValue]);

  // Initialize color system
  const { getColorInfo, isAccentElement } = meta ? useColorSystem(meta, contentSections) : { 
    getColorInfo: () => ({ source: 'default', value: '#000000', canOverride: true }),
    isAccentElement: () => false 
  };

  // Get color inheritance information
  const colorInfo = getColorInfo(sectionId);
  const usesAccentColor = isAccentElement(sectionId);

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
      <div ref={toolbarRef} className="sticky top-0 bg-white border-b border-gray-200 shadow-lg z-30 p-2 sm:p-3" data-inline-editing-panel>
        <div className="flex items-center justify-between">
          {/* Left side - Formatting tools */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 overflow-x-auto">
            {/* Text Formatting */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => onUpdateSection({ isBold: !section.isBold })}
                className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
                  section.isBold ? "bg-blue-100 text-blue-700" : "text-gray-600"
                }`}
                title="Bold"
              >
                <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => onUpdateSection({ isItalic: !section.isItalic })}
                className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
                  section.isItalic ? "bg-blue-100 text-blue-700" : "text-gray-600"
                }`}
                title="Italic"
              >
                <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => onUpdateSection({ isUnderlined: !section.isUnderlined })}
                className={`p-1.5 sm:p-2 rounded hover:bg-gray-100 transition-colors ${
                  section.isUnderlined ? "bg-blue-100 text-blue-700" : "text-gray-600"
                }`}
                title="Underline"
              >
                <Underline className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Font Color */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              {usesAccentColor ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 border border-gray-300 rounded bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400">🎨</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">Uses {colorInfo.source} color</span>
                    <span className="text-xs text-gray-400">Current: {colorInfo.value}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={section.fontColor || colorInfo.value}
                    onChange={(e) => onUpdateSection({ fontColor: e.target.value })}
                    className="w-5 h-5 sm:w-6 sm:h-6 border border-gray-300 rounded cursor-pointer"
                    title="Font Color"
                  />
                </div>
              )}
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>

            {/* Spacing Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Type className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 hidden sm:inline">Top:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={section.spacingTop || 0}
                  onChange={(e) => onUpdateSection({ spacingTop: parseInt(e.target.value) })}
                  className="w-12 sm:w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-6 sm:w-8">{section.spacingTop || 0}px</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 hidden sm:inline">Bot:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={section.spacingBottom || 0}
                  onChange={(e) => onUpdateSection({ spacingBottom: parseInt(e.target.value) })}
                  className="w-12 sm:w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-6 sm:w-8">{section.spacingBottom || 0}px</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 hidden sm:inline">Sides:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={section.spacingSides || 0}
                  onChange={(e) => onUpdateSection({ spacingSides: parseInt(e.target.value) })}
                  className="w-12 sm:w-16 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-500 w-6 sm:w-8">{section.spacingSides || 0}px</span>
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-300"></div>

          </div>

          {/* Right side - Close button */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Done</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
