import React from 'react';
import { CoverLetterMeta, CoverLetterContent } from '@/types/coverLetter';

interface ProfessionalAccentTemplateProps {
  meta: CoverLetterMeta;
  content: CoverLetterContent;
  onElementSelect?: (elementId: string, content: string) => void;
  selectedElement?: string | null;
  editingElementId?: string | null;
}

export default function ProfessionalAccentTemplate({
  meta,
  content,
  onElementSelect,
  selectedElement,
  editingElementId
}: ProfessionalAccentTemplateProps) {
  
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
      textDecoration: formatting?.isUnderlined ? 'underline' : 'none',
      textAlign: formatting?.textAlign || 'left'
    };
  };

  const formatContent = (text: string) => {
    if (!text) return '';
    return text.split('\n\n').filter(para => para.trim()).join('\n\n');
  };

  return (
    <div className="relative bg-white shadow-lg" style={{ width: '794px', maxWidth: '794px' }}>
      {/* Top Right Gradient Background */}
      <div 
        className="absolute top-0 right-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          width: '300px',
          height: '200px',
          clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)'
        }}
      />
      
      {/* Header Elements */}
      {meta.showContactInfo && (
        <div
          className="absolute cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            right: '30px',
            top: '30px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 'normal',
            ...getElementStyle('contact')
          }}
          onClick={() => handleElementClick('contact', meta.contactLine || '')}
        >
          {meta.contactLine || 'Phone • Email • LinkedIn'}
        </div>
      )}

      {/* Main Name */}
      <div
        className="absolute cursor-pointer hover:opacity-80 transition-opacity"
        style={{
          left: '50px',
          top: '30px',
          color: '#1e293b',
          fontSize: '28px',
          fontWeight: 'bold',
          ...getElementStyle('name')
        }}
        onClick={() => handleElementClick('name', meta.yourName || '')}
      >
        {meta.yourName || 'Your Name'}
      </div>

      {/* Recipient Info */}
      {meta.showRecipientInfo && (
        <div
          className="absolute cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            left: '50px',
            top: '80px',
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: 'normal',
            ...getElementStyle('recipient')
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
            left: '50px',
            top: '110px',
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: 'normal',
            ...getElementStyle('company')
          }}
          onClick={() => handleElementClick('company', meta.companyName || '')}
        >
          {meta.companyName || 'Company Name'}
        </div>
      )}

      {/* Date */}
      {meta.showDate && (
        <div
          className="absolute cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            left: '50px',
            top: '150px',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: 'normal',
            ...getElementStyle('date')
          }}
          onClick={() => handleElementClick('date', meta.date || '')}
        >
          {meta.date || new Date().toLocaleDateString()}
        </div>
      )}

      {/* Body Content */}
      <div className="relative" style={{ marginTop: '200px', padding: '0 50px' }}>
        
        {/* Subject/Title */}
        <div
          className="cursor-pointer hover:opacity-80 transition-opacity mb-6"
          style={{
            color: '#1e293b',
            fontSize: '16px',
            fontWeight: 'bold',
            ...getElementStyle('subject')
          }}
          onClick={() => handleElementClick('subject', meta.subject || '')}
        >
          {meta.subject || 'Application for the position of [Job Title]'}
        </div>

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

        {/* Main Content */}
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