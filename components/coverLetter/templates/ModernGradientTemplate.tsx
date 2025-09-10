// components/coverLetter/templates/ModernGradientTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement } from "@/types/coverLetter";

interface ModernGradientTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  renderStructuredContent: React.ReactNode;
}

export const ModernGradientTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  renderStructuredContent
}: ModernGradientTemplateProps) => {
  const { renderDraggableHeaderElement, DensityWrapper, getDensityStyles } = BaseTemplate({
    meta,
    setMeta,
    headerElements,
    setHeaderElements,
    renderStructuredContent
  });

  const densityStyles = getDensityStyles();

  return (
    <DensityWrapper className="pt-8">
      {/* Header */}
      <div className="text-center" style={{ marginBottom: densityStyles.spacing }}>
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
        {renderDraggableHeaderElement('recipient',
          <div className="text-right mb-4">
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
