// components/coverLetter/templates/CorporateTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface CorporateTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const CorporateTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: CorporateTemplateProps) => {
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
    <DensityWrapper className="pt-0">
      {/* Corporate Header */}
      <div className="bg-gray-900 text-white p-8 mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            {/* Left - Name */}
            <div className="flex-1">
              {renderDraggableHeaderElement('name',
                <div>
                  <input
                    type="text"
                    value={meta.yourName}
                    onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                    className="text-4xl font-bold bg-transparent border-none outline-none cursor-text hover:bg-white/10 rounded px-2 py-1 transition-colors"
                    style={getHeaderElementFormatting('name')}
                    placeholder="Your Name"
                  />
                  <div className="w-24 h-1 bg-white mt-2"></div>
                </div>
              )}
            </div>
            
            {/* Right - Contact */}
            {meta.showContactInfo && (
              <div className="text-right">
                {renderDraggableHeaderElement('contact',
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={meta.contactLine}
                      onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
                      className="text-sm bg-transparent border-none outline-none text-right w-full cursor-text hover:bg-white/10 rounded px-2 py-1 transition-colors"
                      style={getHeaderElementFormatting('contact')}
                      placeholder="Contact Information"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto pl-4 pr-8 pb-8">
        {/* Recipient Section */}
        {(meta.showRecipientInfo || meta.showCompanyInfo || meta.showDate) && (
          <div className="mb-8 border-l-4 pl-6" style={{ borderLeftColor: meta.accent }}>
            <div className="space-y-4">
              {meta.showRecipientInfo && renderDraggableHeaderElement('recipient',
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: meta.accent }}>To:</div>
                  <input
                    type="text"
                    value={meta.recipientName || ''}
                    onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="text-xl font-bold bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    style={getHeaderElementFormatting('recipient')}
                    placeholder="Hiring Manager Name"
                  />
                </div>
              )}
              
              {meta.showCompanyInfo && renderDraggableHeaderElement('company',
                <div className="space-y-2 block">
                  <div className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: meta.accent }}>Company:</div>
                  <div className="block">
                    <input
                      type="text"
                      value={meta.companyName || ''}
                      onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
                      className="text-lg font-semibold bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors w-full"
                      style={getHeaderElementFormatting('company')}
                      placeholder="Company Name"
                    />
                  </div>
                  <div className="block">
                    <textarea
                      value={meta.companyAddress || ''}
                      onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                      className="text-sm text-gray-600 bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none text-left w-full"
                      rows={2}
                      placeholder="Company Address"
                    />
                  </div>
                </div>
              )}
              
              {meta.showDate && renderDraggableHeaderElement('date',
                <div>
                  <div className="text-sm font-semibold uppercase tracking-wider mb-1" style={{ color: meta.accent }}>Date:</div>
                  <input
                    type="text"
                    value={meta.date || ''}
                    onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
                    className="text-lg font-semibold bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    style={getHeaderElementFormatting('date')}
                    placeholder="Date"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Structured Content */}
        <div className="prose prose-lg max-w-none">
          {renderStructuredContent}
        </div>
      </div>
    </DensityWrapper>
  );
};
