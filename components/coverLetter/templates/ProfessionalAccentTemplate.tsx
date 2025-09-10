// components/coverLetter/templates/ProfessionalAccentTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement } from "@/types/coverLetter";

interface ProfessionalAccentTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  renderStructuredContent: React.ReactNode;
}

export const ProfessionalAccentTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  renderStructuredContent
}: ProfessionalAccentTemplateProps) => {
  const { renderDraggableHeaderElement, DensityWrapper } = BaseTemplate({
    meta,
    setMeta,
    headerElements,
    setHeaderElements,
    renderStructuredContent
  });

  return (
    <DensityWrapper className="pt-8">
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
          {renderDraggableHeaderElement('contact',
            <textarea
              value={meta.contactLine}
              onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
              className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
              rows={3}
              placeholder="Contact Information"
            />
          )}
          {renderDraggableHeaderElement('recipient',
            <div className="mt-4">
              <input
                type="text"
                value={meta.recipientName || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
                className="text-sm font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Hiring Manager Name"
              />
            </div>
          )}
          {renderDraggableHeaderElement('company',
            <div className="mt-2">
              <input
                type="text"
                value={meta.companyName || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
                className="text-sm bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Company Name"
              />
              <textarea
                value={meta.companyAddress || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                className="text-sm bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
                rows={2}
                placeholder="Company Address"
              />
            </div>
          )}
          {renderDraggableHeaderElement('date',
            <div className="mt-2">
              <input
                type="text"
                value={meta.date || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
                className="text-sm bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Date"
              />
            </div>
          )}
        </div>
        <div 
          className="w-4"
          style={{ backgroundColor: meta.accent }}
        />
      </div>

      {/* Structured Content */}
      {renderStructuredContent}
    </DensityWrapper>
  );
};
