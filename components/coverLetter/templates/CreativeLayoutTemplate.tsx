// components/coverLetter/templates/CreativeLayoutTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface CreativeLayoutTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const CreativeLayoutTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: CreativeLayoutTemplateProps) => {
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
    <DensityWrapper className="pt-0 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={meta.accent} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 pl-4 pr-8 py-4 mx-auto">
        {/* Top Section - Name and Contact */}
        <div className="flex justify-between items-start mb-12">
          {/* Left - Name */}
          <div className="flex-1">
            {renderDraggableHeaderElement('name',
              <div>
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-6xl font-black bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  style={getHeaderElementFormatting('name')}
                  placeholder="Your Name"
                />
                <div className="w-32 h-2 mt-4" style={{ backgroundColor: meta.accent }}></div>
              </div>
            )}
          </div>
          
          {/* Right - Contact */}
          <div className="text-right">
            {renderDraggableHeaderElement('contact',
              <div className="space-y-2">
                {meta.contactLine?.split('\n').map((line, index) => (
                  <div key={index} className="text-sm font-medium" style={getHeaderElementFormatting('contact')}>{line}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Middle Section - Recipient Info */}
        <div className="mb-12">
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="grid grid-cols-2 gap-8">
              {renderDraggableHeaderElement('recipient',
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: meta.accent }}>TO:</div>
                  <input
                    type="text"
                    value={meta.recipientName || ''}
                    onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
                    className="text-xl font-bold bg-transparent border-none outline-none cursor-text hover:bg-white rounded px-2 py-1 transition-colors"
                    placeholder="Hiring Manager Name"
                  />
                </div>
              )}
              
              {renderDraggableHeaderElement('date',
                <div className="text-right">
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: meta.accent }}>DATE:</div>
                  <input
                    type="text"
                    value={meta.date || ''}
                    onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
                    className="text-lg font-semibold bg-transparent border-none outline-none text-right cursor-text hover:bg-white rounded px-2 py-1 transition-colors"
                    placeholder="Date"
                  />
                </div>
              )}
            </div>
            
            {renderDraggableHeaderElement('company',
              <div className="mt-4">
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: meta.accent }}>COMPANY:</div>
                <input
                  type="text"
                  value={meta.companyName || ''}
                  onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
                  className="text-lg font-semibold bg-transparent border-none outline-none cursor-text hover:bg-white rounded px-2 py-1 transition-colors mb-2"
                  placeholder="Company Name"
                />
                <textarea
                  value={meta.companyAddress || ''}
                  onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                  className="text-sm text-gray-600 bg-transparent border-none outline-none cursor-text hover:bg-white rounded px-2 py-1 transition-colors resize-none w-full"
                  rows={2}
                  placeholder="Company Address"
                />
              </div>
            )}
          </div>
        </div>

        {/* Structured Content */}
        <div className="prose prose-lg max-w-none">
          {renderStructuredContent}
        </div>
      </div>
    </DensityWrapper>
  );
};
