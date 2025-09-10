// components/coverLetter/templates/MinimalElegantTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement } from "@/types/coverLetter";

interface MinimalElegantTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  renderStructuredContent: React.ReactNode;
}

export const MinimalElegantTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  renderStructuredContent
}: MinimalElegantTemplateProps) => {
  const { renderDraggableHeaderElement, DensityWrapper } = BaseTemplate({
    meta,
    setMeta,
    headerElements,
    setHeaderElements,
    renderStructuredContent
  });

  return (
    <DensityWrapper className="pt-8 p-12">
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
        {renderDraggableHeaderElement('recipient',
          <div className="text-right mb-4 mt-8">
            <input
              type="text"
              value={meta.recipientName || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
              className="text-sm font-medium bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              placeholder="Hiring Manager Name"
            />
          </div>
        )}
        {renderDraggableHeaderElement('company',
          <div className="text-right mb-4">
            <input
              type="text"
              value={meta.companyName || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
              className="text-sm bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              placeholder="Company Name"
            />
            <textarea
              value={meta.companyAddress || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
              className="text-sm bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
              rows={2}
              placeholder="Company Address"
            />
          </div>
        )}
        {renderDraggableHeaderElement('date',
          <div className="text-right mb-4">
            <input
              type="text"
              value={meta.date || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
              className="text-sm bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              placeholder="Date"
            />
          </div>
        )}
      </div>

      {/* Structured Content */}
      {renderStructuredContent}
    </DensityWrapper>
  );
};
