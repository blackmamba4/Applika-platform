// components/coverLetter/templates/SplitLayoutTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface SplitLayoutTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const SplitLayoutTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: SplitLayoutTemplateProps) => {
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
    <DensityWrapper className="pt-0 relative overflow-hidden min-h-screen">
      {/* Diagonal Background Split */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, ${meta.accent}20 0%, ${meta.accent}20 50%, transparent 50%, transparent 100%)`
          }}
        />
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(135deg, transparent 0%, transparent 50%, ${meta.accent}10 50%, ${meta.accent}10 100%)`
          }}
        />
      </div>

      {/* Decorative Circles */}
      <div className="absolute top-8 left-8 w-16 h-16 rounded-full border-2 opacity-20" style={{ borderColor: meta.accent }}></div>
      <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full border-2 opacity-20" style={{ borderColor: meta.accent }}></div>

      {/* Content */}
      <div className="relative z-10 pl-4 pr-8 py-4 mx-auto">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center mb-8">
            {/* Profile Picture */}
            <div className="w-20 h-20 rounded-lg overflow-hidden mr-6 shadow-lg">
              {meta.logoUrl ? (
                <img src={meta.logoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: meta.accent }}
                >
                  {meta.yourName?.charAt(0) || 'Y'}
                </div>
              )}
            </div>
            
            {/* Name and Title */}
            <div className="flex-1">
              {renderDraggableHeaderElement('name',
                <div>
                  <div className="text-sm font-bold uppercase tracking-wider mb-2" style={{ color: meta.accent }}>COVER LETTER</div>
                  <input
                    type="text"
                    value={meta.yourName}
                    onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                    className="text-4xl font-bold bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    style={getHeaderElementFormatting('name')}
                    placeholder="Your Name"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Normal Layout - No Sections */}
        <div className="mb-8 space-y-4">
          {renderDraggableHeaderElement('contact',
            <div className="text-right mb-4">
              <div className="space-y-1">
                {meta.contactLine?.split('\n').map((line, index) => (
                  <div key={index} className="text-sm" style={getHeaderElementFormatting('contact')}>{line}</div>
                ))}
              </div>
            </div>
          )}
          
          {renderDraggableHeaderElement('recipient',
            <div>
              <div className="text-sm text-gray-500 mb-2">To:</div>
              <input
                type="text"
                value={meta.recipientName || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
                className="text-lg font-semibold bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Hiring Manager Name"
              />
            </div>
          )}
          
          {renderDraggableHeaderElement('company',
            <div className="space-y-2 block">
              <div className="block">
                <input
                  type="text"
                  value={meta.companyName || ''}
                  onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
                  className="text-base font-medium bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors w-full"
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
          
          {renderDraggableHeaderElement('date',
            <div>
              <input
                type="text"
                value={meta.date || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
                className="text-sm font-medium bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Date"
              />
            </div>
          )}
        </div>

        {/* Structured Content */}
        <div className="mt-12 prose prose-lg max-w-none">
          {renderStructuredContent}
        </div>
      </div>
    </DensityWrapper>
  );
};
