// components/coverLetter/SettingsPanel.tsx
"use client";

import { useState, useEffect } from "react";
import { Palette, Layout, Eye, EyeOff } from "lucide-react";
import { ColorWheel } from "./ColorWheel";
import { FONT_OPTIONS, TEMPLATE_OPTIONS } from "@/constants/coverLetterOptions";
import { getTemplateDefaultAccentColor, getTemplateDefaultGradientColors } from "@/lib/color-system";
import { getTemplateConfig } from "@/lib/template-configs";
import { setHeaderVisibilityPreference } from "@/lib/header-visibility";
import type { CoverLetterMeta } from "@/types/coverLetter";

interface SettingsPanelProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: "design" | "layout";
  setActiveTab: React.Dispatch<React.SetStateAction<"design" | "layout">>;
  freeformElements?: any[]; // Elements from FreeformEditor
}

// Type for header visibility keys
type HeaderVisibilityKey = 'showContactInfo' | 'showRecipientInfo' | 'showCompanyInfo' | 'showDate';

export const SettingsPanel = ({
  meta,
  setMeta,
  showSettings,
  setShowSettings,
  activeTab,
  setActiveTab,
  freeformElements = []
}: SettingsPanelProps) => {
  const toggleHeaderElementVisibility = (key: HeaderVisibilityKey) => {
    const newValue = !meta[key];
    setMeta(prev => ({ ...prev, [key]: newValue }));
    setHeaderVisibilityPreference(key, newValue);
  };

  const toggleFreeformElementVisibility = (elementId: string) => {
    if ((window as any).toggleElementVisibility) {
      (window as any).toggleElementVisibility(elementId);
    }
  };

  if (!showSettings) return null;

  return (
    <div className="fixed top-0 right-0 w-80 bg-white border-l border-gray-200 flex flex-col h-full z-40 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <EyeOff className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {[
            { id: "design", label: "Design", icon: Palette },
            { id: "layout", label: "Layout", icon: Layout }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors whitespace-nowrap ${
                activeTab === id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Design Tab */}
        {activeTab === "design" && (
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Template</h4>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATE_OPTIONS.slice(0, 8).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      const defaultAccentColor = getTemplateDefaultAccentColor(template.id);
                      setMeta(prev => ({ 
                        ...prev, 
                        template: template.id as any,
                        accent: defaultAccentColor
                      }));
                    }}
                    className={`p-2 text-xs rounded border transition-colors flex items-center gap-2 ${
                      meta.template === template.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <span>{template.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color - Hide for modernGradient and defaultBasic templates */}
            {meta.template !== 'modernGradient' && meta.template !== 'defaultBasic' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Accent Color</h4>
                <ColorWheel
                  selectedColor={meta.accent}
                  onColorChange={(color) => setMeta(prev => ({ ...prev, accent: color }))}
                />
              </div>
            )}

            {/* Gradient Colors - Only show for modernGradient template */}
            {meta.template === 'modernGradient' && (
              <>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Gradient Color 1</h4>
                  <ColorWheel
                    selectedColor={meta.gradientColor1 || getTemplateDefaultGradientColors(meta.template).gradientColor1}
                    onColorChange={(color) => setMeta(prev => ({ ...prev, gradientColor1: color }))}
                  />
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Gradient Color 2</h4>
                  <ColorWheel
                    selectedColor={meta.gradientColor2 || getTemplateDefaultGradientColors(meta.template).gradientColor2}
                    onColorChange={(color) => setMeta(prev => ({ ...prev, gradientColor2: color }))}
                  />
                </div>
              </>
            )}

            {/* Font Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Font</h4>
              <select
                value={meta.font}
                onChange={(e) => setMeta(prev => ({ ...prev, font: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === "layout" && (
          <div className="space-y-6">


            {/* Personal Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-600">Your Name</label>
                  <input
                    type="text"
                    value={meta.yourName}
                    onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Contact Information</label>
                  <textarea
                    value={meta.contactLine}
                    onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    rows={3}
                    placeholder="Phone: (555) 123-4567&#10;Email: your.email@example.com&#10;LinkedIn: linkedin.com/in/yourname"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Signature Name</label>
                  <input
                    type="text"
                    value={meta.signatureName}
                    onChange={(e) => setMeta(prev => ({ ...prev, signatureName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    placeholder="Your Name"
                  />
                </div>
              </div>
            </div>

            {/* Template Elements */}
            {freeformElements.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Template Elements</h4>
                <div className="space-y-2">
                  {freeformElements.map((element) => {
                    const getElementLabel = (elementId: string, elementType: string) => {
                      if (elementType === 'custom') {
                        return 'Custom Text Box';
                      }
                      
                      const labels: Record<string, string> = {
                        name: 'Your Name',
                        title: 'Your Title',
                        contact: 'Contact Information',
                        recipient: 'Recipient Information',
                        company: 'Company Information',
                        date: 'Date',
                        greeting: 'Greeting',
                        content: 'Main Content',
                        closing: 'Closing',
                        signature: 'Signature'
                      };
                      return labels[elementId] || elementId;
                    };
                    
                    return (
                      <div key={element.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                        <span className="text-sm text-gray-700">{getElementLabel(element.id, element.type)}</span>
                        <button
                          onClick={() => toggleFreeformElementVisibility(element.id)}
                          className={`p-1 rounded transition-colors ${
                            element.visible ? "text-blue-600" : "text-gray-400"
                          }`}
                        >
                          {element.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};