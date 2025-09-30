// components/coverLetter/ColorWheel.tsx
"use client";

import { useState } from "react";

interface ColorWheelProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const ColorWheel = ({ selectedColor, onColorChange }: ColorWheelProps) => {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div className="space-y-2 relative">
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
          style={{ backgroundColor: selectedColor }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
          placeholder="#000000"
        />
      </div>
      
      {showPicker && (
        <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="space-y-3">
            {/* Full Color Picker */}
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-full h-12 border border-gray-300 rounded cursor-pointer"
            />
            
            {/* Quick Preset Colors */}
            <div className="grid grid-cols-8 gap-1">
              {[
                "#ef4444", "#f97316", "#f59e0b", "#84cc16",
                "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
                "#8b5cf6", "#a855f7", "#ec4899", "#f43f5e",
                "#6b7280", "#374151", "#000000", "#ffffff"
              ].map((color) => (
                <button
                  key={color}
                  className="w-6 h-6 rounded border border-gray-300 hover:border-gray-400 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onColorChange(color);
                    setShowPicker(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
