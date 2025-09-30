// components/coverLetter/templates/DefaultTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface DefaultTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const DefaultTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: DefaultTemplateProps) => {
  const { renderDraggableHeaderElement, DensityWrapper, getHeaderElementFormatting } = BaseTemplate({
    meta,
    setMeta,
    headerElements,
    setHeaderElements,
    contentSections,
    renderStructuredContent,
    onHeaderElementClick,
    editingElementId
  });

  return (
    <DensityWrapper className="pt-0 pl-2 pr-12 py-6 mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        {renderDraggableHeaderElement('name',
          <div className="mb-6">
            <input
              type="text"
              value={meta.yourName}
              onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
              className="text-4xl font-bold mb-2 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={getHeaderElementFormatting('name')}
              placeholder="Your Name"
            />
            <div className="w-20 h-1 mx-auto" style={{ backgroundColor: meta.accent }}></div>
          </div>
        )}
        
        {meta.showContactInfo && renderDraggableHeaderElement('contact',
          <div className="mb-8">
            <input
              type="text"
              value={meta.contactLine}
              onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
              className="text-sm bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={getHeaderElementFormatting('contact')}
              placeholder="Contact Information"
            />
          </div>
        )}
        
        {meta.showRecipientInfo && renderDraggableHeaderElement('recipient',
          <div className="text-right mb-6 mt-8">
            <input
              type="text"
              value={meta.recipientName || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
              className="text-lg font-semibold bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={getHeaderElementFormatting('recipient')}
              placeholder="Hiring Manager Name"
            />
          </div>
        )}
        
        {meta.showCompanyInfo && renderDraggableHeaderElement('company',
          <div className="text-right mb-6">
            <input
              type="text"
              value={meta.companyName || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
              className="text-base font-medium bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={getHeaderElementFormatting('company')}
              placeholder="Company Name"
            />
            <textarea
              value={meta.companyAddress || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
              className="text-sm text-gray-600 bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
              rows={2}
              placeholder="Company Address"
            />
          </div>
        )}
        
        {meta.showDate && renderDraggableHeaderElement('date',
          <div className="text-right mb-6">
            <input
              type="text"
              value={meta.date || ''}
              onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
              className="text-sm font-medium bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={getHeaderElementFormatting('date')}
              placeholder="Date"
            />
          </div>
        )}
      </div>

      {/* Structured Content */}
      <div className="prose prose-lg max-w-none">
        {renderStructuredContent}
      </div>
    </DensityWrapper>
  );
};
