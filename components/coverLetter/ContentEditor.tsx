// components/coverLetter/ContentEditor.tsx
"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { GripVertical } from "lucide-react";
import { InlineEditingPanel } from "./InlineEditingPanel";
import type { CoverLetterMeta, ContentSection } from "@/types/coverLetter";

interface ContentEditorProps {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  contentSections: ContentSection[];
  setContentSections: React.Dispatch<React.SetStateAction<ContentSection[]>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  editingElementId: string | null;
  setEditingElementId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const ContentEditor = ({
  content,
  setContent,
  meta,
  setMeta,
  contentSections,
  setContentSections,
  isEditing,
  setIsEditing,
  editingElementId,
  setEditingElementId
}: ContentEditorProps) => {

  // Simple function to get current value for editing
  const getCurrentValue = useCallback((elementId: string) => {
    switch (elementId) {
      case 'name': return meta.yourName || '';
      case 'contact': return meta.contactLine || '';
      case 'recipient': return meta.recipientName || '';
      case 'company': return meta.companyName || '';
      case 'date': return meta.date || '';
      case 'greeting': return meta.greeting || '';
      case 'body': return content || '';
      case 'closing': return meta.closing || '';
      case 'signature': return meta.signatureName || '';
      default: return '';
    }
  }, [meta, content]);

  // Function to get actual section data for editing
  const getSectionData = useCallback((elementId: string) => {
    // For header elements, get from meta
    if (['name', 'contact', 'recipient', 'company', 'date'].includes(elementId)) {
      const formatting = meta[`${elementId}Formatting` as keyof typeof meta] as Partial<ContentSection> || {};
      return {
        id: elementId,
        label: elementId,
        visible: true,
        order: 0,
        isBold: formatting.isBold || false,
        isItalic: formatting.isItalic || false,
        isUnderlined: formatting.isUnderlined || false,
        fontColor: formatting.fontColor || '#000000',
        spacingTop: formatting.spacingTop || 0,
        spacingBottom: formatting.spacingBottom || 0,
        spacingSides: formatting.spacingSides || 0,
        highlightedText: formatting.highlightedText || '',
        highlightColor: formatting.highlightColor || '#ffff00'
      };
    }
    
    // For content sections, get from contentSections
    const section = contentSections.find(s => s.id === elementId);
    return section || {
      id: elementId,
      label: elementId,
      visible: true,
      order: 0,
      isBold: false,
      isItalic: false,
      isUnderlined: false,
      fontColor: '#000000',
      spacingTop: 0,
      spacingBottom: 0,
      spacingSides: 0,
      highlightedText: '',
      highlightColor: '#ffff00'
    };
  }, [contentSections, meta]);

  // Function to update section properties
  const updateSection = useCallback((sectionId: string, updates: Partial<ContentSection>) => {
    setContentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, ...updates }
          : section
      )
    );
  }, [setContentSections]);

  const updateSectionProperties = useCallback((updates: Partial<ContentSection>) => {
    if (!editingElementId) return;
    
    // For content sections, update the contentSections array
    if (['greeting', 'body', 'closing', 'signature'].includes(editingElementId)) {
      updateSection(editingElementId, updates);
    }
    // For header elements, store formatting in meta
    else if (['name', 'contact', 'recipient', 'company', 'date'].includes(editingElementId)) {
      setMeta(prev => ({
        ...prev,
        [`${editingElementId}Formatting`]: {
          ...prev[`${editingElementId}Formatting` as keyof typeof prev],
          ...updates
        }
      }));
    }
  }, [editingElementId, updateSection, setMeta]);

  // Simple save function
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
      }
    }
    setEditingElementId(null);
    setIsEditing(false);
  }, [editingElementId, setMeta, setIsEditing]);

  // Simple cancel function
  const cancelEdit = useCallback(() => {
    setEditingElementId(null);
    setIsEditing(false);
  }, [setEditingElementId, setIsEditing]);

  // Handle clicks outside to close editing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if click is on any editable element using data attribute
      const isClickOnEditableElement = target.closest('[data-editable-element="true"]');
      
      // Check if click is on the inline editing panel
      const isClickOnInlinePanel = target.closest('[data-inline-editing-panel]');
      
      // Only close if clicking on truly empty space (not on any editable element or panel)
      if (!isClickOnEditableElement && !isClickOnInlinePanel && editingElementId) {
        cancelEdit();
      }
    };
  
    if (editingElementId) {
      // Add a small delay to prevent immediate closing on double-clicks
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [editingElementId, cancelEdit]);

  // Helper functions for individual section styling
  const getSectionSpacing = (sectionId: string) => {
    const section = contentSections.find(s => s.id === sectionId);
    const spacing = section?.spacing || 50; // Default to 50%
    return Math.round(16 + (spacing / 100) * 32); // Convert to 16-48px range
  };

  const getSectionStyles = (sectionId: string) => {
    const section = contentSections.find(s => s.id === sectionId);
    return {
      color: section?.fontColor || 'inherit',
      fontWeight: section?.isBold ? 'bold' : 'normal',
      fontStyle: section?.isItalic ? 'italic' : 'normal',
      textDecoration: section?.isUnderlined ? 'underline' : 'none',
      paddingTop: section?.spacingTop ? `${section.spacingTop}px` : '0',
      paddingBottom: section?.spacingBottom ? `${section.spacingBottom}px` : '0',
      paddingLeft: section?.spacingSides ? `${section.spacingSides}px` : '0',
      paddingRight: section?.spacingSides ? `${section.spacingSides}px` : '0'
    };
  };

  const highlightText = (text: string, sectionId: string) => {
    const section = contentSections.find(s => s.id === sectionId);
    if (!section?.highlightedText || !section?.highlightColor) return text;
    
    const regex = new RegExp(`(${section.highlightedText})`, 'gi');
    return text.replace(regex, `<mark style="background-color: ${section.highlightColor}; padding: 2px 4px; border-radius: 3px;">$1</mark>`);
  };

  const startEditing = useCallback((sectionId: string, currentValue: string) => {
    setEditingElementId(sectionId);
    setIsEditing(true);
  }, [setEditingElementId, setIsEditing]);

  const handleDragStart = useCallback((e: React.DragEvent, sectionId: string) => {
    e.dataTransfer.setData('text/plain', sectionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    const draggedSectionId = e.dataTransfer.getData('text/plain');
    
    if (draggedSectionId === targetSectionId) return;

    const draggedSection = contentSections.find(s => s.id === draggedSectionId);
    const targetSection = contentSections.find(s => s.id === targetSectionId);
    
    if (!draggedSection || !targetSection) return;

    const newSections = contentSections.map(section => {
      if (section.id === draggedSectionId) {
        return { ...section, order: targetSection.order };
      } else if (section.id === targetSectionId) {
        return { ...section, order: draggedSection.order };
      }
      return section;
    });

    setContentSections(newSections);
  }, [contentSections, setContentSections]);

  const getSortedSections = useCallback(() => {
    return [...contentSections].sort((a, b) => a.order - b.order);
  }, [contentSections]);

  const renderStructuredContent = useMemo(() => {
    const sortedSections = getSortedSections();
    const visibleSections = sortedSections.filter(section => section.visible);
    
    const elements: React.ReactNode[] = [];
    
    visibleSections.forEach(section => {
      switch (section.id) {
        case 'greeting':
          if (meta.greeting) {
            elements.push(
               <div 
                 key="greeting" 
                 className="font-medium hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
                 style={{ 
                   marginBottom: `${getSectionSpacing('greeting')}px`,
                   ...getSectionStyles('greeting')
                 }}
                 draggable
                 onDragStart={(e) => handleDragStart(e, 'greeting')}
                 onDragOver={handleDragOver}
                 onDrop={(e) => handleDrop(e, 'greeting')}
                 data-editable-element="true"
               >
                <div className="flex items-center gap-2">
                  <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingElementId === 'greeting' ? (
                      <input
                        type="text"
                        value={getCurrentValue('greeting')}
                        onChange={(e) => {
                          setMeta(prev => ({ ...prev, greeting: e.target.value }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none font-medium"
                        style={getSectionStyles('greeting')}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('greeting', meta.greeting || '')}
                        title="Click to edit"
                        style={getSectionStyles('greeting')}
                        dangerouslySetInnerHTML={{ __html: highlightText(meta.greeting, 'greeting') }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          }
          break;
          
        case 'body':
          elements.push(
            <div 
              key="body" 
              className="hover:bg-gray-50 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
              style={{ 
                marginBottom: `${getSectionSpacing('body')}px`, 
                ...getSectionStyles('body')
              }}
              draggable
              onDragStart={(e) => handleDragStart(e, 'body')}
              onDragOver={handleDragOver}
                 data-editable-element="true"
            >
              <div className="flex items-start gap-2">
                <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors flex-shrink-0">
                  <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1 w-full">
                  {editingElementId === 'body' ? (
                    <textarea
                      value={getCurrentValue('body')}
                      onChange={(e) => {
                        setContent(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          e.preventDefault();
                          cancelEdit();
                        }
                      }}
                      className="w-full bg-transparent border-none outline-none resize-none whitespace-pre-wrap leading-relaxed"
                      style={getSectionStyles('body')}
                      autoFocus
                      rows={10}
                    />
                  ) : (
                    <div
                      className="cursor-text hover:bg-gray-100 whitespace-pre-wrap leading-relaxed"
                      onClick={() => startEditing('body', content)}
                      title="Click to edit"
                      style={getSectionStyles('body')}
                      dangerouslySetInnerHTML={{ __html: highlightText(content, 'body') }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
          break;
          
        case 'closing':
          if (meta.closing) {
            elements.push(
              <div 
                key="closing" 
                className="font-medium hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
                style={{ 
                  marginBottom: `${getSectionSpacing('closing')}px`,
                  ...getSectionStyles('closing')
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, 'closing')}
                onDragOver={handleDragOver}
                 data-editable-element="true"
              >
                <div className="flex items-center gap-2">
                  <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingElementId === 'closing' ? (
                      <input
                        type="text"
                        value={getCurrentValue('closing')}
                        onChange={(e) => {
                          setMeta(prev => ({ ...prev, closing: e.target.value }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none font-medium"
                        style={getSectionStyles('closing')}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('closing', meta.closing || '')}
                        title="Click to edit"
                        style={getSectionStyles('closing')}
                        dangerouslySetInnerHTML={{ __html: highlightText(meta.closing, 'closing') }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          }
          break;
          
        case 'signature':
          if (meta.signatureName) {
            elements.push(
              <div 
                key="signature" 
                className="font-bold hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
                style={{ 
                  marginBottom: `${getSectionSpacing('signature')}px`,
                  ...getSectionStyles('signature')
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, 'signature')}
                onDragOver={handleDragOver}
                 data-editable-element="true"
              >
                <div className="flex items-center gap-2">
                  <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingElementId === 'signature' ? (
                      <input
                        type="text"
                        value={getCurrentValue('signature')}
                        onChange={(e) => {
                          setMeta(prev => ({ ...prev, signatureName: e.target.value }));
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            e.preventDefault();
                            cancelEdit();
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none font-bold"
                        style={getSectionStyles('signature')}
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('signature', meta.signatureName || '')}
                        title="Click to edit"
                        style={getSectionStyles('signature')}
                        dangerouslySetInnerHTML={{ __html: highlightText(meta.signatureName, 'signature') }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          }
          break;
      }
    });
    
    return elements;
  }, [contentSections, meta.greeting, meta.closing, meta.signatureName, content, getSortedSections, startEditing, saveEdit, cancelEdit, updateSection]);

  return (
    <div className="mb-6 w-full">
      {renderStructuredContent}
    </div>
  );
};
