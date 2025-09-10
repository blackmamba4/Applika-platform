// components/coverLetter/TemplateRenderer.tsx
"use client";

import { useMemo } from "react";
import { GripVertical } from "lucide-react";
import type { CoverLetterMeta, HeaderElement } from "@/types/coverLetter";

interface TemplateRendererProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  renderStructuredContent: React.ReactNode;
}

export const TemplateRenderer = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  renderStructuredContent
}: TemplateRendererProps) => {
  const getFontFamily = () => {
    const fontMap: Record<string, string> = {
      inter: "Inter, sans-serif",
      poppins: "Poppins, sans-serif",
      montserrat: "Montserrat, sans-serif",
      georgia: "Georgia, serif",
      playfair: "Playfair Display, serif",
      system: "system-ui, sans-serif"
    };
    return fontMap[meta.font] || "Inter, sans-serif";
  };

  const getDensityStyles = () => {
    const densityMap = {
      compact: { padding: "16px", lineHeight: "1.4", spacing: "12px" },
      normal: { padding: "24px", lineHeight: "1.6", spacing: "16px" },
      roomy: { padding: "32px", lineHeight: "1.8", spacing: "24px" }
    };
    return densityMap[meta.density];
  };

  const renderDraggableHeaderElement = (elementId: string, children: React.ReactNode, className: string = "") => {
    const element = headerElements.find(e => e.id === elementId);
    if (!element || !element.visible) return null;

    return (
      <div
        key={elementId}
        className={`group relative ${className}`}
      >
        <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {children}
      </div>
    );
  };

  const densityStyles = getDensityStyles();
  const fontFamily = getFontFamily();

  // Modern Gradient Template
  if (meta.template === 'modernGradient') {
    return (
      <>
        {/* Header */}
        <div className="text-center mb-8">
          {renderDraggableHeaderElement('name',
            <input
              type="text"
              value={meta.yourName}
              onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
              className="text-4xl font-bold mb-2 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={{ 
                background: `linear-gradient(135deg, ${meta.accent}, #6366f1)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            />
          )}
          {renderDraggableHeaderElement('contact',
            <textarea
              value={meta.contactLine}
              onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
              className="text-sm text-gray-600 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
              rows={3}
            />
          )}
        </div>

        {/* Structured Content */}
        {renderStructuredContent}
      </>
    );
  }

  // Professional Accent Template
  if (meta.template === 'professionalAccent') {
    return (
      <>
        {/* Header with Accent Block */}
        <div className="flex">
          <div className="flex-1 p-8">
            {renderDraggableHeaderElement('name',
              <input
                type="text"
                value={meta.yourName}
                onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                className="text-3xl font-bold mb-2 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                style={{ 
                  color: meta.accent,
                  maxWidth: '100%',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word'
                }}
                placeholder="Your Name"
              />
            )}
            <input
              type="text"
              value={meta.contactLine?.split('\n')[3] || 'Professional Title'}
              onChange={(e) => {
                const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                lines[3] = e.target.value;
                setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
              }}
              className="text-lg text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              placeholder="Professional Title"
            />
          </div>
          <div 
            className="w-4"
            style={{ backgroundColor: meta.accent }}
          />
        </div>

        {/* Structured Content */}
        {renderStructuredContent}
      </>
    );
  }

  // Sidebar Profile Template
  if (meta.template === 'sidebarProfile') {
    return (
      <div className="flex h-full">
        {/* Left Sidebar */}
        <div 
          className="w-48 p-6 text-white flex flex-col"
          style={{ backgroundColor: meta.accent }}
        >
          {/* Profile Picture */}
          <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            {meta.logoUrl ? (
              <img src={meta.logoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="text-2xl font-bold">{meta.yourName?.charAt(0) || 'Y'}</div>
            )}
          </div>
          
          {/* Contact Info */}
          <div className="text-center space-y-2 text-sm">
            {meta.contactLine?.split('\n').map((line, index) => (
              <div key={index} className="text-white/90">{line}</div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Structured Content */}
          {renderStructuredContent}
        </div>
      </div>
    );
  }

  // Minimal Elegant Template
  if (meta.template === 'minimalElegant') {
    return (
      <div className="p-12">
        {/* Header */}
        <div className="text-center mb-12">
          {renderDraggableHeaderElement('name',
            <input
              type="text"
              value={meta.yourName}
              onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
              className="text-4xl font-light mb-4 tracking-wide bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={{ 
                color: meta.accent,
                maxWidth: '100%',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
              placeholder="Your Name"
            />
          )}
          <div className="w-24 h-px mx-auto mb-4" style={{ backgroundColor: meta.accent }} />
          {renderDraggableHeaderElement('contact',
            <textarea
              value={meta.contactLine}
              onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
              className="text-sm text-gray-500 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
              rows={3}
            />
          )}
        </div>

        {/* Structured Content */}
        {renderStructuredContent}
      </div>
    );
  }

  // Default fallback template
  return (
    <div className="p-8">
      {/* Header */}
      <div className="text-center mb-8">
        {renderDraggableHeaderElement('name',
          <input
            type="text"
            value={meta.yourName}
            onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
            className="text-3xl font-bold mb-2 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            style={{ color: meta.accent }}
          />
        )}
        {renderDraggableHeaderElement('contact',
          <textarea
            value={meta.contactLine}
            onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
            className="text-sm text-gray-600 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
            rows={3}
          />
        )}
      </div>

      {/* Structured Content */}
      {renderStructuredContent}
    </div>
  );
};
