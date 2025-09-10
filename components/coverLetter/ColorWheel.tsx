// components/coverLetter/ColorWheel.tsx
"use client";

import { useState } from "react";

interface ColorWheelProps {
  value: string;
  onChange: (color: string) => void;
  label: string;
}

export const ColorWheel = ({ value, onChange, label }: ColorWheelProps) => {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer hover:border-gray-400 transition-colors"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
          placeholder="#000000"
        />
      </div>
      
      {showPicker && (
        <div className="absolute top-full left-0 z-50 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="grid grid-cols-4 gap-2">
            {[
              "#10b981", "#6366f1", "#8b5cf6", "#f43f5e",
              "#f97316", "#14b8a6", "#a855f7", "#ec4899",
              "#ef4444", "#f59e0b", "#84cc16", "#06b6d4",
              "#3b82f6", "#8b5cf6", "#ec4899", "#f97316"
            ].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color }}
                onClick={() => {
                  onChange(color);
                  setShowPicker(false);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
