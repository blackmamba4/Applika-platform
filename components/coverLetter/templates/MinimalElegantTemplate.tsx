// components/coverLetter/templates/MinimalElegantTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface MinimalElegantTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const MinimalElegantTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: MinimalElegantTemplateProps) => {
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
    <DensityWrapper className="pt-0 p-8 bg-gray-50 min-h-screen">
      <div className="mx-auto bg-white shadow-2xl rounded-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-white p-8 border-b-8" style={{ borderBottomColor: meta.accent }}>
          <div className="text-center mb-8">
            {renderDraggableHeaderElement('name',
              <div>
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-5xl font-light tracking-wide bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors mb-4"
                  style={getHeaderElementFormatting('name')}
                  placeholder="Your Name"
                />
                <div className="w-32 h-px mx-auto mb-6" style={{ backgroundColor: meta.accent }} />
              </div>
            )}
            
            {renderDraggableHeaderElement('contact',
              <div>
                {meta.contactLine?.split('\n').map((line, index) => (
                  <div key={index} className="text-sm mb-1" style={getHeaderElementFormatting('contact')}>{line}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Recipient Section */}
          <div className="mb-12 space-y-6">
            {renderDraggableHeaderElement('recipient',
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2 font-medium">TO:</div>
                <input
                  type="text"
                  value={meta.recipientName || ''}
                  onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
                  className="text-xl font-semibold bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Hiring Manager Name"
                />
              </div>
            )}
            
            {renderDraggableHeaderElement('company',
              <div className="text-right space-y-2">
                <input
                  type="text"
                  value={meta.companyName || ''}
                  onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
                  className="text-lg font-medium bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
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
            
            {renderDraggableHeaderElement('date',
              <div className="text-right">
                <input
                  type="text"
                  value={meta.date || ''}
                  onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
                  className="text-sm font-medium bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Date"
                />
              </div>
            )}
          </div>

          {/* Structured Content */}
          <div className="prose prose-lg max-w-none" style={{ fontFamily: 'Georgia, serif' }}>
            {renderStructuredContent}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-8 text-center">
          <div className="w-24 h-px mx-auto mb-4" style={{ backgroundColor: meta.accent }} />
          <div className="text-xs text-gray-500 tracking-wider">PROFESSIONAL COVER LETTER</div>
        </div>
      </div>
    </DensityWrapper>
  );
};
