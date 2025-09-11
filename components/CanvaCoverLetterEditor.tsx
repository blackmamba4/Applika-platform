// components/CanvaCoverLetterEditor.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Download, Palette, Save } from "lucide-react";
import { useToast } from "@/components/ToastGlobal";
import { SettingsPanel } from "./coverLetter/SettingsPanel";
import { ContentEditor } from "./coverLetter/ContentEditor";
import { TemplateRenderer } from "./coverLetter/TemplateRenderer";
import { A4PageBreak } from "./coverLetter/A4PageBreak";
import type { CoverLetterMeta, CoverLetterEditorProps, ContentSection, HeaderElement } from "@/types/coverLetter";

export default function CanvaCoverLetterEditor({
  letterId,
  initialTitle,
  initialBody,
  initialMeta,
  onBackToStep1
}: CoverLetterEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialBody);
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "structure" | "design" | "details">("content");
  const [isEditing, setIsEditing] = useState(false);
  
  // Content sections management
  const [contentSections, setContentSections] = useState<ContentSection[]>([
    { id: 'greeting', label: 'Greeting', visible: true, order: 0 },
    { id: 'body', label: 'Body Content', visible: true, order: 1 },
    { id: 'closing', label: 'Closing', visible: true, order: 2 },
    { id: 'signature', label: 'Signature', visible: true, order: 3 }
  ]);

  // Header elements management
  const [headerElements, setHeaderElements] = useState<HeaderElement[]>([
    { id: 'name', label: 'Your Name', visible: true, order: 0 },
    { id: 'contact', label: 'Contact Info', visible: true, order: 1 },
    { id: 'recipient', label: 'Recipient', visible: true, order: 2 },
    { id: 'company', label: 'Company Info', visible: true, order: 3 },
    { id: 'date', label: 'Date', visible: true, order: 4 }
  ]);
  
  const [meta, setMeta] = useState<CoverLetterMeta>({
    template: "modernGradient",
    accent: "#10B981",
    font: "inter",
    density: "normal",
    headerStyle: "centered",
    footerStyle: "none",
    showDivider: true,
    signatureUrl: "",
    yourInitials: "",
    showSignature: false,
    companyAddress: "",
    showRecipientBlock: true,
    recipient: "Hiring Manager",
    contactLine: "(555) 123-4567\nyour@email.com\nCity, State\nProfessional Title",
    yourName: "Your Name",
    company: "Company Name",
    dateLine: new Date().toLocaleDateString(),
    greeting: "Dear Hiring Manager,",
    closing: "Sincerely,",
    signatureName: "Your Name",
    gradientColor: "#10B981",
    showA4PageBreak: false,
    ...initialMeta,
  });

  const toast = useToast();

  // Manual save functionality
  const saveLetter = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/cover-letters/${letterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          meta
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save cover letter');
      }

      toast.show({
        message: "Cover letter saved successfully!"
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.show({
        message: "Failed to save cover letter"
      });
    } finally {
      setIsSaving(false);
    }
  }, [letterId, title, content, meta, isSaving, toast]);

  const exportToPDF = useCallback(async () => {
    try {
      // This would implement PDF export functionality
      toast.show({
        message: "PDF export feature coming soon!"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.show({
        message: "Failed to export PDF"
      });
    }
  }, [toast]);
    
    return (
    <div className="h-screen flex flex-col bg-gray-50">
              {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <button
                onClick={onBackToStep1}
              className="p-2 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
              >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            
                    <input
                      type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg sm:text-xl lg:text-2xl font-semibold bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors flex-1 min-w-0"
              placeholder="Cover Letter Title"
                    />
                  </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={saveLetter}
              disabled={isSaving}
              className="p-2 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            >
              <Save className="h-5 w-5 text-gray-600" />
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded transition-colors ${
                showSettings ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
              }`}
            >
              <Palette className="h-5 w-5" />
            </button>
            
            <button
              onClick={exportToPDF}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <Download className="h-5 w-5 text-gray-600" />
            </button>
            
            {isSaving && (
              <div className="text-sm text-gray-500 hidden sm:block">Saving...</div>
            )}
          </div>
                    </div>
                  </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Cover Letter Preview */}
          <div className="flex-1 overflow-y-auto">
          <div className="w-full">
            <div 
                className={`bg-white shadow-lg rounded-lg overflow-hidden relative ${
                  meta.showA4PageBreak ? 'a4-page-break' : ''
                }`}
                style={{ 
                  fontFamily: meta.font === 'inter' ? 'Inter, sans-serif' : 'system-ui, sans-serif',
                  width: '100%',
                  minWidth: '800px',
                  position: 'relative', // Always relative for toolbar positioning
                  ...(meta.showA4PageBreak && {
                    maxWidth: '210mm',
                    minHeight: '297mm',
                    margin: '0 auto'
                  })
                }}
              >
                <A4PageBreak 
                  show={meta.showA4PageBreak || false}
                  isEditing={isEditing}
                />
                <TemplateRenderer
                  meta={meta}
                  setMeta={setMeta}
                  headerElements={headerElements}
                  setHeaderElements={setHeaderElements}
                  renderStructuredContent={
                    <ContentEditor
                      content={content}
                      setContent={setContent}
                      meta={meta}
                      setMeta={setMeta}
                      contentSections={contentSections}
                      setContentSections={setContentSections}
                      isEditing={isEditing}
                      setIsEditing={setIsEditing}
                    />
                  }
                />
                          </div>
                    </div>
                    </div>
                  </div>

        {/* Settings Panel - Now a fixed overlay for all screen sizes */}
        <SettingsPanel
          meta={meta}
          setMeta={setMeta}
          contentSections={contentSections}
          setContentSections={setContentSections}
          headerElements={headerElements}
          setHeaderElements={setHeaderElements}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

                  </div>
    </div>
  );
}
