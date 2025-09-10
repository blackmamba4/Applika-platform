// components/coverLetter/SettingsPanel.tsx
"use client";

import { useState } from "react";
import { Type, Palette, Layout, Settings, Eye, EyeOff } from "lucide-react";
import { ColorWheel } from "./ColorWheel";
import { FONT_OPTIONS, TEMPLATE_OPTIONS, DENSITY_OPTIONS, ACCENT_COLORS } from "@/constants/coverLetterOptions";
import type { CoverLetterMeta, ContentSection, HeaderElement } from "@/types/coverLetter";

interface SettingsPanelProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  contentSections: ContentSection[];
  setContentSections: React.Dispatch<React.SetStateAction<ContentSection[]>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  showSettings: boolean;
  setShowSettings: React.Dispatch<React.SetStateAction<boolean>>;
  activeTab: "content" | "structure" | "design" | "details";
  setActiveTab: React.Dispatch<React.SetStateAction<"content" | "structure" | "design" | "details">>;
}

export const SettingsPanel = ({
  meta,
  setMeta,
  contentSections,
  setContentSections,
  headerElements,
  setHeaderElements,
  showSettings,
  setShowSettings,
  activeTab,
  setActiveTab
}: SettingsPanelProps) => {
  const toggleSectionVisibility = (sectionId: string) => {
    setContentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  const toggleHeaderVisibility = (elementId: string) => {
    setHeaderElements(prev => 
      prev.map(element => 
        element.id === elementId 
          ? { ...element, visible: !element.visible }
          : element
      )
    );
  };

  if (!showSettings) return null;

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <EyeOff className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3">
          {[
            { id: "content", label: "Content", icon: Type },
            { id: "structure", label: "Structure", icon: Layout },
            { id: "design", label: "Design", icon: Palette },
            { id: "details", label: "Details", icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${
                activeTab === id
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Content Sections</h4>
            {contentSections.map((section) => (
              <div key={section.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{section.label}</span>
                <button
                  onClick={() => toggleSectionVisibility(section.id)}
                  className={`p-1 rounded transition-colors ${
                    section.visible ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            ))}
            
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Greeting</h5>
              <input
                type="text"
                value={meta.greeting || ""}
                onChange={(e) => setMeta(prev => ({ ...prev, greeting: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Dear Hiring Manager,"
              />
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Closing</h5>
              <input
                type="text"
                value={meta.closing || ""}
                onChange={(e) => setMeta(prev => ({ ...prev, closing: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Sincerely,"
              />
            </div>
            
            <div className="space-y-3">
              <h5 className="font-medium text-gray-900">Signature Name</h5>
              <input
                type="text"
                value={meta.signatureName || ""}
                onChange={(e) => setMeta(prev => ({ ...prev, signatureName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Your Name"
              />
            </div>
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === "structure" && (
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Header Elements</h4>
            {headerElements.map((element) => (
              <div key={element.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{element.label}</span>
                <button
                  onClick={() => toggleHeaderVisibility(element.id)}
                  className={`p-1 rounded transition-colors ${
                    element.visible ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  {element.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

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
                    onClick={() => setMeta(prev => ({ ...prev, template: template.id as any }))}
                    className={`p-2 text-xs rounded border transition-colors ${
                      meta.template === template.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-lg mb-1">{template.icon}</div>
                    <div className="font-medium">{template.name}</div>
                  </button>
                ))}
              </div>
            </div>

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

            {/* Density Selection */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Density</h4>
              <div className="space-y-2">
                {DENSITY_OPTIONS.map((density) => (
                  <button
                    key={density.id}
                    onClick={() => setMeta(prev => ({ ...prev, density: density.id as any }))}
                    className={`w-full p-2 text-sm rounded border transition-colors ${
                      meta.density === density.id
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{density.name}</div>
                    <div className="text-xs text-gray-500">{density.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <ColorWheel
              value={meta.accent}
              onChange={(color) => setMeta(prev => ({ ...prev, accent: color }))}
              label="Accent Color"
            />
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Your Name</h4>
              <input
                type="text"
                value={meta.yourName}
                onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Your Name"
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
              <textarea
                value={meta.contactLine}
                onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                rows={4}
                placeholder="Phone\nEmail\nCity, State\nProfessional Title"
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recipient</h4>
              <input
                type="text"
                value={meta.recipient}
                onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Hiring Manager"
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Company</h4>
              <input
                type="text"
                value={meta.company}
                onChange={(e) => setMeta(prev => ({ ...prev, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                placeholder="Company Name"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
