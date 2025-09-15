// components/coverLetter/templates/ProfessionalAccentTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface ProfessionalAccentTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const ProfessionalAccentTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: ProfessionalAccentTemplateProps) => {
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
      {/* Header with Flipped Diagonal Shape */}
      <div className="relative h-64 mb-8 overflow-hidden">
        {/* Flipped Diagonal Background */}
        <div 
          className="absolute bottom-0 left-0 w-full h-full transform -rotate-12 origin-bottom-left"
          style={{ 
            background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`,
            clipPath: 'polygon(0% 0%, 70% 0%, 100% 100%, 0% 100%)'
          }}
        />
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 pr-8 mx-auto">
          {/* Left Side - Name */}
          <div className="flex-1 max-w-md">
            {renderDraggableHeaderElement('name',
              <div>
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-4xl font-bold bg-transparent border-none outline-none cursor-text hover:bg-white/10 rounded px-2 py-1 transition-colors w-full"
                  style={getHeaderElementFormatting('name')}
                  placeholder="Your Name"
                />
              </div>
            )}
          </div>
          
          {/* Right Side - Contact Info */}
          <div className="text-right max-w-sm">
            {renderDraggableHeaderElement('contact',
              <div className="space-y-1">
                {meta.contactLine?.split('\n').map((line, index) => (
                  <div key={index} className="text-sm font-medium" style={getHeaderElementFormatting('contact')}>{line}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 pr-8 pb-8 mx-auto">
        {/* Recipient Info */}
        <div className="mb-8 space-y-4">
          {renderDraggableHeaderElement('recipient',
            <div>
              <div className="text-sm mb-2" style={{ color: '#6b7280' }}>To:</div>
              <input
                type="text"
                value={meta.recipientName || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
                className="text-lg font-semibold bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                style={getHeaderElementFormatting('recipient')}
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
                  style={getHeaderElementFormatting('company')}
                  placeholder="Company Name"
                />
              </div>
              <div className="block">
                <textarea
                  value={meta.companyAddress || ''}
                  onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                  className="text-sm bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none text-left w-full"
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
      </div>
    </DensityWrapper>
  );
};
