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
    <div className="fixed top-0 right-0 w-80 bg-white border-l border-gray-200 flex flex-col h-full z-40 shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Customize</h3>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <EyeOff className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-1 mt-3 overflow-x-auto">
          {[
            { id: "content", label: "Content", icon: Type },
            { id: "structure", label: "Structure", icon: Layout },
            { id: "design", label: "Design", icon: Palette },
            { id: "details", label: "Details", icon: Settings }
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
        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-6">
            <h4 className="font-medium text-gray-900">Content Sections</h4>
            {contentSections.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{section.label}</span>
                  <button
                    onClick={() => toggleSectionVisibility(section.id)}
                    className={`p-1 rounded transition-colors ${
                      section.visible ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Individual Section Controls */}
                <div className="space-y-3">
                  {/* Spacing Control */}
                  <div>
                    <label className="text-xs text-gray-600">Spacing</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={section.spacing || 50}
                        onChange={(e) => setContentSections(prev => 
                          prev.map(s => s.id === section.id 
                            ? { ...s, spacing: parseInt(e.target.value) }
                            : s
                          )
                        )}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-500 w-12">{section.spacing || 50}%</span>
                    </div>
                  </div>

                  {/* Font Color */}
                  <div>
                    <label className="text-xs text-gray-600">Font Color</label>
                    <input
                      type="color"
                      value={section.fontColor || '#000000'}
                      onChange={(e) => setContentSections(prev => 
                        prev.map(s => s.id === section.id 
                          ? { ...s, fontColor: e.target.value }
                          : s
                        )
                      )}
                      className="w-full h-8 border border-gray-300 rounded cursor-pointer"
                    />
                  </div>

                  {/* Bold & Underline */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContentSections(prev => 
                        prev.map(s => s.id === section.id 
                          ? { ...s, isBold: !s.isBold }
                          : s
                        )
                      )}
                      className={`px-3 py-1 text-xs rounded border transition-colors ${
                        section.isBold 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Bold
                    </button>
                    <button
                      onClick={() => setContentSections(prev => 
                        prev.map(s => s.id === section.id 
                          ? { ...s, isUnderlined: !s.isUnderlined }
                          : s
                        )
                      )}
                      className={`px-3 py-1 text-xs rounded border transition-colors ${
                        section.isUnderlined 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      Underline
                    </button>
                  </div>

                  {/* Text Highlighting */}
                  <div className="space-y-2">
                    <label className="text-xs text-gray-600">Highlight Text</label>
                    <input
                      type="text"
                      value={section.highlightedText || ''}
                      onChange={(e) => setContentSections(prev => 
                        prev.map(s => s.id === section.id 
                          ? { ...s, highlightedText: e.target.value }
                          : s
                        )
                      )}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                      placeholder="Text to highlight"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={section.highlightColor || '#ffff00'}
                        onChange={(e) => setContentSections(prev => 
                          prev.map(s => s.id === section.id 
                            ? { ...s, highlightColor: e.target.value }
                            : s
                          )
                        )}
                        className="w-8 h-6 border border-gray-300 rounded cursor-pointer"
                      />
                      <span className="text-xs text-gray-500">Highlight color</span>
                    </div>
                  </div>
                </div>
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

            {/* A4 Page Break Toggle */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Page Layout</h4>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div>
                  <div className="font-medium text-sm">A4 Page Break</div>
                  <div className="text-xs text-gray-500">Show page break lines for A4 printing</div>
                </div>
                <button
                  onClick={() => setMeta(prev => ({ ...prev, showA4PageBreak: !prev.showA4PageBreak }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    meta.showA4PageBreak ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      meta.showA4PageBreak ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
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
