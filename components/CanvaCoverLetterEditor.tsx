// components/CanvaCoverLetterEditor.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Download, Palette, Save } from "lucide-react";
import { useToast } from "@/components/ToastGlobal";
import { SettingsPanel } from "./coverLetter/SettingsPanel";
import { ContentEditor } from "./coverLetter/ContentEditor";
import { TemplateRenderer } from "./coverLetter/TemplateRenderer";
import { InlineEditingPanel } from "./coverLetter/InlineEditingPanel";
import { A4PageBreak } from "./coverLetter/A4PageBreak";
import { applyHeaderVisibilityPreferences } from "@/lib/header-visibility";
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
  const [activeTab, setActiveTab] = useState<"design" | "layout">("design");
  const [isEditing, setIsEditing] = useState(false);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  
  // Content sections management
  const [contentSections, setContentSections] = useState<ContentSection[]>([
    { 
      id: 'greeting', 
      label: 'Greeting', 
      visible: true, 
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      fontColor: '',
      spacingTop: 0,
      spacingBottom: 0,
      spacingSides: 0,
      highlightedText: '',
      highlightColor: '#ffff00'
    },
    { 
      id: 'body', 
      label: 'Body Content', 
      visible: true, 
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      fontColor: '',
      spacingTop: 0,
      spacingBottom: 0,
      spacingSides: 0,
      highlightedText: '',
      highlightColor: '#ffff00'
    },
    { 
      id: 'closing', 
      label: 'Closing', 
      visible: true, 
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      fontColor: '',
      spacingTop: 0,
      spacingBottom: 0,
      spacingSides: 0,
      highlightedText: '',
      highlightColor: '#ffff00'
    },
    { 
      id: 'signature', 
      label: 'Signature', 
      visible: true, 
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      fontColor: '',
      spacingTop: 0,
      spacingBottom: 0,
      spacingSides: 0,
      highlightedText: '',
      highlightColor: '#ffff00'
    }
  ]);

  // Header elements management
  const [headerElements, setHeaderElements] = useState<HeaderElement[]>([
    { id: 'name', label: 'Your Name', visible: true },
    { id: 'contact', label: 'Contact Info', visible: true },
    { id: 'recipient', label: 'Recipient', visible: true },
    { id: 'company', label: 'Company Info', visible: true },
    { id: 'date', label: 'Date', visible: true }
  ]);
  
  const [meta, setMeta] = useState<CoverLetterMeta>(() => {
    const defaultMeta = {
      template: "defaultBasic" as const,
      accent: "#2563EB", // Default blue for defaultBasic template
      font: "inter" as const,
      density: "normal" as const,
      headerStyle: "centered" as const,
      footerStyle: "none" as const,
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
      date: new Date().toLocaleDateString(),
      greeting: "Dear Hiring Manager,",
      closing: "Sincerely,",
      signatureName: "Your Name",
      showA4PageBreak: false,
      // Default visibility values (will be overridden by localStorage preferences)
      showContactInfo: false,
      showRecipientInfo: false,
      showCompanyInfo: false,
      showDate: true,
      ...initialMeta,
    };
    
    // Apply localStorage preferences on client-side
    return applyHeaderVisibilityPreferences(defaultMeta);
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

  // Helper functions for InlineEditingPanel
  const getCurrentValue = useCallback((elementId: string) => {
    switch (elementId) {
      case 'name': return meta.yourName || '';
      case 'contact': return meta.contactLine || '';
      case 'recipient': return meta.recipientName || '';
      case 'company': return meta.companyName || '';
      case 'date': return meta.date || '';
      case 'subject': return meta.subject || '';
      case 'greeting': return meta.greeting || '';
      case 'body': return content || '';
      case 'closing': return meta.closing || '';
      case 'signature': return meta.signatureName || '';
      default: return '';
    }
  }, [meta, content]);

  const getSectionData = useCallback((elementId: string) => {
    // For header elements and FreeformEditor elements, get from meta
    if (['name', 'contact', 'recipient', 'company', 'date', 'subject', 'greeting', 'closing', 'signature', 'content'].includes(elementId)) {
      const formatting = meta[`${elementId}Formatting` as keyof typeof meta] as Partial<ContentSection> || {};
      const sectionData = {
        id: elementId,
        label: elementId,
        visible: true,
        isBold: formatting.isBold || false,
        isItalic: formatting.isItalic || false,
        isUnderlined: formatting.isUnderlined || false,
        fontColor: formatting.fontColor || '', // Empty string allows template defaults to work
        textAlign: formatting.textAlign || 'left', // Add textAlign to section data
        spacingTop: formatting.spacingTop || 0,
        spacingBottom: formatting.spacingBottom || 0,
        spacingSides: formatting.spacingSides || 0,
        highlightedText: formatting.highlightedText || '',
        highlightColor: formatting.highlightColor || '#ffff00'
      };
      return sectionData;
    }
    
    // For content sections, get from contentSections
    const section = contentSections.find(s => s.id === elementId);
    return section || {
      id: elementId,
      label: elementId,
      visible: true,
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      fontColor: '', // Empty string allows template defaults to work
      textAlign: 'left',
      spacingTop: 0,
      spacingBottom: 0,
      spacingSides: 0,
      highlightedText: '',
      highlightColor: '#ffff00'
    };
  }, [contentSections, meta]);

  const updateSectionProperties = useCallback((updates: Partial<ContentSection>) => {
    if (!editingElementId) return;
    
    // For content sections, update the contentSections array
    if (['greeting', 'body', 'closing', 'signature'].includes(editingElementId)) {
      setContentSections(prev => 
        prev.map(section => 
          section.id === editingElementId 
            ? { ...section, ...updates }
            : section
        )
      );
    }
    // For header elements and FreeformEditor elements, store formatting in meta
    else if (['name', 'contact', 'recipient', 'company', 'date', 'subject', 'greeting', 'closing', 'signature', 'content'].includes(editingElementId)) {
      setMeta(prev => {
        const newFormatting = {
          ...(prev[`${editingElementId}Formatting` as keyof typeof prev] as any || {}),
          ...updates
        };
        
        // Also trigger the FreeformEditor's updateElementStyle function
        if ((window as any).updateElementStyle) {
          // Use setTimeout to ensure meta update happens first
          setTimeout(() => {
            (window as any).updateElementStyle(editingElementId, updates);
          }, 0);
        }
        
        return {
          ...prev,
          [`${editingElementId}Formatting`]: newFormatting
        };
      });
    }
  }, [editingElementId, setContentSections, setMeta]);

  const saveEdit = useCallback((value: string) => {
    if (editingElementId) {
      switch (editingElementId) {
        case 'name':
          setMeta(prev => ({ ...prev, yourName: value }));
          break;
        case 'contact':
          setMeta(prev => ({ ...prev, contactLine: value }));
          break;
        case 'recipient':
          setMeta(prev => ({ ...prev, recipientName: value }));
          break;
        case 'company':
          setMeta(prev => ({ ...prev, companyName: value }));
          break;
        case 'date':
          setMeta(prev => ({ ...prev, date: value }));
          break;
        case 'subject':
          setMeta(prev => ({ ...prev, subject: value }));
          break;
        case 'greeting':
          setMeta(prev => ({ ...prev, greeting: value }));
          break;
        case 'body':
          setContent(value);
          break;
        case 'closing':
          setMeta(prev => ({ ...prev, closing: value }));
          break;
        case 'signature':
          setMeta(prev => ({ ...prev, signatureName: value }));
          break;
      }
    }
    setEditingElementId(null);
    setIsEditing(false);
  }, [editingElementId, setMeta, setContent, setEditingElementId, setIsEditing]);

  const cancelEdit = useCallback(() => {
    setEditingElementId(null);
    setIsEditing(false);
  }, [setEditingElementId, setIsEditing]);

  // Handle header element clicks for inline editing
  const handleHeaderElementClick = useCallback((elementId: string | null, currentValue?: string) => {
    if (elementId) {
      // Always switch to the clicked element - don't prevent any clicks
      setEditingElementId(elementId);
      setIsEditing(true);
    }
  }, [editingElementId]);

  const exportToPDF = useCallback(async () => {
    try {
      // Import the new PDF export function
      const { exportCoverLetterToPDFWithPuppeteer } = await import('@/lib/pdf-export');
      
      // Export the actual template to PDF (preserves all styling)
      await exportCoverLetterToPDFWithPuppeteer('cover-letter-template', title || 'Cover Letter');
      
      toast.show({
        message: "PDF exported successfully!"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.show({
        message: "Failed to export PDF. Please try again."
      });
    }
  }, [toast, title]);
    
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
            {/* Inline Editing Panel - positioned at top of scrolling container */}
            {editingElementId && (
                  <InlineEditingPanel
                    sectionId={editingElementId}
                    section={getSectionData(editingElementId)}
                    currentValue={getCurrentValue(editingElementId)}
                    onSave={saveEdit}
                    onCancel={cancelEdit}
                    onUpdateSection={updateSectionProperties}
                    templateType={meta.template}
                    meta={meta}
                    contentSections={contentSections}
                  />
            )}
            
            <div className="w-full overflow-x-auto">
            <div 
                className={`bg-white shadow-lg rounded-lg overflow-hidden relative ${
                  meta.showA4PageBreak ? 'a4-page-break' : ''
                }`}
                style={{ 
                  fontFamily: meta.font === 'inter' ? 'Inter, sans-serif' : 'system-ui, sans-serif',
                  width: '100%',
                  minWidth: '320px', // Much smaller minimum width for mobile
                  maxWidth: '100%',
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
                <div id="cover-letter-template">
                  <TemplateRenderer
                    meta={meta}
                    setMeta={setMeta}
                    contentSections={contentSections}
                    onHeaderElementClick={handleHeaderElementClick}
                    editingElementId={editingElementId}
                    content={content}
                    setContent={setContent}
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
                        editingElementId={editingElementId}
                        setEditingElementId={setEditingElementId}
                      />
                    }
                  />
                </div>
                          </div>
                    </div>
                    </div>
                  </div>

        {/* Settings Panel - Now a fixed overlay for all screen sizes */}
        <SettingsPanel
          meta={meta}
          setMeta={setMeta}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

                  </div>
    </div>
  );
}
