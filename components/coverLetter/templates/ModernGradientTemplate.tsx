import React from 'react';
import { CoverLetterMeta, CoverLetterContent } from '@/types/coverLetter';

interface ModernGradientTemplateProps {
  meta: CoverLetterMeta;
  content: CoverLetterContent;
  onElementSelect?: (elementId: string, content: string) => void;
  selectedElement?: string | null;
  editingElementId?: string | null;
}

export default function ModernGradientTemplate({
  meta,
  content,
  onElementSelect,
  selectedElement,
  editingElementId
}: ModernGradientTemplateProps) {
  
  const handleElementClick = (elementId: string, elementContent: string) => {
    if (onElementSelect) {
      onElementSelect(elementId, elementContent);
    }
  };

  const getElementStyle = (elementId: string) => {
    const formatting = meta[`${elementId}Formatting` as keyof typeof meta] as any;
    return {
      fontSize: formatting?.fontSize || 16,
      fontWeight: formatting?.isBold ? 'bold' : 'normal',
      color: formatting?.fontColor || '#1e293b',
      fontStyle: formatting?.isItalic ? 'italic' : 'normal',
      textDecoration: formatting?.isUnderlined ? 'underline' : 'none'
    };
  };

  const formatContent = (text: string) => {
    if (!text) return '';
    return text.split('\n\n').filter(para => para.trim()).join('\n\n');
  };

  return (
    <div className="relative bg-white shadow-lg" style={{ width: '794px', maxWidth: '794px' }}>
      {/* Gradient Header Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #ec4899 0%, #f97316 100%)',
          height: '200px'
        }}
      />
      
      {/* White Body Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: '#ffffff',
          top: '200px',
          height: 'calc(100% - 200px)'
        }}
      />
      
      {/* Header Elements */}
      {meta.showContactInfo && (
        <div
          className="absolute cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            left: '50px',
            top: '20px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'normal'
          }}
          onClick={() => handleElementClick('contact', meta.contactLine || '')}
        >
          {meta.contactLine || 'Phone • Address • Email • LinkedIn'}
        </div>
      )}

      {meta.showRecipientInfo && (
        <div
          className="absolute cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            left: '50px',
            top: '50px',
            color: '#ffffff',
            fontSize: '18px',
            fontWeight: '600'
          }}
          onClick={() => handleElementClick('recipient', meta.recipientName || '')}
        >
          {meta.recipientName || 'Hiring Manager'}
        </div>
      )}

      {meta.showCompanyInfo && (
        <div
          className="absolute cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            left: '500px',
            top: '100px',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '500'
          }}
          onClick={() => handleElementClick('company', meta.companyName || '')}
        >
          {meta.companyName || 'Company Name'}
        </div>
      )}

      {/* Main Name */}
      <div
        className="absolute cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          left: '50px',
          top: '120px',
          color: '#ffffff',
          fontSize: '24px',
          fontWeight: 'bold',
          ...getElementStyle('name')
        }}
        onClick={() => handleElementClick('name', meta.yourName || '')}
      >
        {meta.yourName || 'Your Name'}
      </div>

      {/* Body Content */}
      <div className="relative" style={{ marginTop: '200px', padding: '0 50px' }}>
        
        {/* Date */}
        {meta.showDate && (
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity mb-4"
            style={{
              color: '#666666',
              fontSize: '14px',
              fontWeight: 'normal',
              ...getElementStyle('date')
            }}
            onClick={() => handleElementClick('date', meta.date || '')}
          >
            {meta.date || new Date().toLocaleDateString()}
          </div>
        )}

        {/* Greeting */}
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity mb-6"
          style={{
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: 'normal',
            ...getElementStyle('greeting')
          }}
          onClick={() => handleElementClick('greeting', meta.greeting || '')}
        >
          {meta.greeting || 'Dear Hiring Manager,'}
        </div>

        {/* Main Content - Draggable */}
        <div
          className="absolute cursor-move hover:opacity-80 transition-opacity"
          style={{
            left: '50px',
            top: '320px',
            width: '694px',
            color: '#334155',
            fontSize: '16px',
            fontWeight: 'normal',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap' as const,
            border: selectedElement === 'content' ? '2px dashed #3b82f6' : 'none',
            padding: selectedElement === 'content' ? '8px' : '0',
            borderRadius: selectedElement === 'content' ? '4px' : '0',
            ...getElementStyle('content')
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleElementClick('content', content.mainContent || '');
          }}
          onMouseDown={(e) => {
            // Make it draggable
            e.preventDefault();
            // You could add drag logic here if needed
          }}
        >
          {content.mainContent || 'Your cover letter content goes here...'}
        </div>

        {/* Closing */}
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity mb-4"
          style={{
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: 'normal',
            ...getElementStyle('closing')
          }}
          onClick={() => handleElementClick('closing', meta.closing || '')}
        >
          {meta.closing || 'Sincerely,'}
        </div>

        {/* Signature */}
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: 'bold',
            ...getElementStyle('signature')
          }}
          onClick={() => handleElementClick('signature', meta.signatureName || '')}
        >
          {meta.signatureName || 'Your Name'}
        </div>
      </div>
    </div>
  );
}
