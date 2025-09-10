// components/coverLetter/templates/SidebarProfileTemplate.tsx
"use client";

import { BaseTemplate } from "./BaseTemplate";
import type { CoverLetterMeta, HeaderElement } from "@/types/coverLetter";

interface SidebarProfileTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  renderStructuredContent: React.ReactNode;
}

export const SidebarProfileTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  renderStructuredContent
}: SidebarProfileTemplateProps) => {
  const { renderDraggableHeaderElement, DensityWrapper } = BaseTemplate({
    meta,
    setMeta,
    headerElements,
    setHeaderElements,
    renderStructuredContent
  });

  return (
    <DensityWrapper className="pt-8 flex h-full">
      {/* Left Sidebar */}
      <div 
        className="w-48 p-6 text-white flex flex-col"
        style={{ backgroundColor: meta.accent }}
      >
        {/* Profile Picture */}
        <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          {meta.logoUrl ? (
            <img src={meta.logoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
          ) : (
            <div className="text-2xl font-bold">{meta.yourName?.charAt(0) || 'Y'}</div>
          )}
        </div>
        
        {/* Contact Info */}
        <div className="text-center space-y-2 text-sm">
          {meta.contactLine?.split('\n').map((line, index) => (
            <div key={index} className="text-white/90">{line}</div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header Elements */}
        <div className="mb-8">
          {renderDraggableHeaderElement('name',
            <input
              type="text"
              value={meta.yourName}
              onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
              className="text-2xl font-bold mb-4 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              style={{ color: meta.accent }}
            />
          )}
          {renderDraggableHeaderElement('contact',
            <textarea
              value={meta.contactLine}
              onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
              className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors resize-none mb-4"
              rows={3}
              placeholder="Contact Information"
            />
          )}
          {renderDraggableHeaderElement('recipient',
            <div className="mb-4">
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
            <div className="mb-4">
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
            <div className="mb-4">
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

        {/* Structured Content */}
        {renderStructuredContent}
      </div>
    </DensityWrapper>
  );
};
