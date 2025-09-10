// components/coverLetter/ContentEditor.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { GripVertical } from "lucide-react";
import type { CoverLetterMeta, ContentSection } from "@/types/coverLetter";

interface ContentEditorProps {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  contentSections: ContentSection[];
  setContentSections: React.Dispatch<React.SetStateAction<ContentSection[]>>;
}

export const ContentEditor = ({
  content,
  setContent,
  meta,
  setMeta,
  contentSections,
  setContentSections
}: ContentEditorProps) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEditing = useCallback((sectionId: string, currentValue: string) => {
    setEditingSection(sectionId);
    setEditValue(currentValue);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingSection && editValue !== undefined) {
      switch (editingSection) {
        case 'greeting':
          setMeta(prev => ({ ...prev, greeting: editValue }));
          break;
        case 'closing':
          setMeta(prev => ({ ...prev, closing: editValue }));
          break;
        case 'signature':
          setMeta(prev => ({ ...prev, signatureName: editValue }));
          break;
        case 'body':
          setContent(editValue);
          break;
      }
    }
    setEditingSection(null);
    setEditValue("");
  }, [editingSection, editValue, setMeta, setContent]);

  const cancelEdit = useCallback(() => {
    setEditingSection(null);
    setEditValue("");
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

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
                className="mb-4 font-medium hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingSection === 'greeting' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none font-medium"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('greeting', meta.greeting || '')}
                        title="Click to edit"
                      >
                        {meta.greeting}
                      </div>
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
              className="mb-6 hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
            >
              <div className="flex items-start gap-2">
                <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
                  <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex-1">
                  {editingSection === 'body' ? (
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-transparent border-none outline-none resize-none whitespace-pre-wrap leading-relaxed min-h-[200px]"
                      autoFocus
                      data-editing="body"
                      style={{
                        height: 'auto',
                        minHeight: '200px',
                        maxHeight: 'none'
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = Math.max(200, target.scrollHeight) + 'px';
                      }}
                    />
                  ) : (
                    <div
                      className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded whitespace-pre-wrap leading-relaxed"
                      onClick={() => startEditing('body', content)}
                      title="Click to edit"
                    >
                      {content}
                    </div>
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
                className="mb-4 font-medium hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingSection === 'closing' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none font-medium"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('closing', meta.closing || '')}
                        title="Click to edit"
                      >
                        {meta.closing}
                      </div>
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
              >
                <div className="flex items-center gap-2">
                  <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingSection === 'signature' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none font-bold"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('signature', meta.signatureName || '')}
                        title="Click to edit"
                      >
                        {meta.signatureName}
                      </div>
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
  }, [contentSections, meta.greeting, meta.closing, meta.signatureName, content, editingSection, editValue, getSortedSections, startEditing, saveEdit, handleKeyDown]);

  return (
    <div className="mb-6 w-full min-h-96">
      {renderStructuredContent}
    </div>
  );
};
