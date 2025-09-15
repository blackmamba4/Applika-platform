// components/coverLetter/templates/SidebarProfileTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface SidebarProfileTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const SidebarProfileTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: SidebarProfileTemplateProps) => {
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
    <DensityWrapper className="pt-0 flex h-full min-h-screen mx-auto">
      {/* Left Sidebar - Contact Info */}
      <div 
        className="w-48 p-4 text-white flex flex-col relative"
        style={{ 
          background: `linear-gradient(135deg, ${meta.accent}, ${meta.accent}dd)`,
          minHeight: '100vh'
        }}
      >
        {/* Profile Picture */}
        <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          {meta.logoUrl ? (
            <img src={meta.logoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="text-3xl font-bold text-white">{meta.yourName?.charAt(0) || 'Y'}</div>
          )}
        </div>
        
        {/* Contact Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-white/80">CONTACT</h3>
            <div className="space-y-3 text-sm">
              {meta.contactLine?.split('\n').map((line, index) => (
                <div key={index} className="leading-relaxed" style={getHeaderElementFormatting('contact')}>{line}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="w-full h-px bg-white/20 mb-4"></div>
          <div className="text-xs text-white/60 text-center">
            Professional Cover Letter
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2 pr-6 bg-white">
        {/* Header Elements */}
        <div className="mb-8">
          {renderDraggableHeaderElement('name',
            <div className="mb-6">
              <input
                type="text"
                value={meta.yourName}
                onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                className="text-4xl font-bold bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                style={getHeaderElementFormatting('name')}
                placeholder="Your Name"
              />
              <div className="w-16 h-1 mt-2" style={{ backgroundColor: meta.accent }}></div>
            </div>
          )}
          
          {renderDraggableHeaderElement('recipient',
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">TO:</div>
              <input
                type="text"
                value={meta.recipientName || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, recipientName: e.target.value }))}
                className="text-lg font-semibold bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Hiring Manager Name"
              />
            </div>
          )}
          
          {renderDraggableHeaderElement('company',
            <div className="mb-6">
              <input
                type="text"
                value={meta.companyName || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, companyName: e.target.value }))}
                className="text-base font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors mb-2"
                placeholder="Company Name"
              />
              <textarea
                value={meta.companyAddress || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none"
                rows={2}
                placeholder="Company Address"
              />
            </div>
          )}
          
          {renderDraggableHeaderElement('date',
            <div className="mb-6">
              <input
                type="text"
                value={meta.date || ''}
                onChange={(e) => setMeta(prev => ({ ...prev, date: e.target.value }))}
                className="text-sm font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
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
