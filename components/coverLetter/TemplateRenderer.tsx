// components/coverLetter/TemplateRenderer.tsx
"use client";

import { 
  ModernGradientTemplate,
  ProfessionalAccentTemplate,
  MinimalElegantTemplate,
  SidebarProfileTemplate,
  DefaultTemplate,
  CreativeLayoutTemplate,
  CorporateTemplate,
  SplitLayoutTemplate
} from './templates';
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";

interface TemplateRendererProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const TemplateRenderer = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: TemplateRendererProps) => {
  const templateProps = {
    meta,
    setMeta,
    headerElements,
    setHeaderElements,
    contentSections,
    renderStructuredContent,
    onHeaderElementClick,
    editingElementId
  };

  // Modern Gradient Template - Diagonal teal shape
  if (meta.template === 'modernGradient') {
    return <ModernGradientTemplate {...templateProps} />;
  }

  // Professional Accent Template - Colorful gradient header
  if (meta.template === 'professionalAccent') {
    return <ProfessionalAccentTemplate {...templateProps} />;
  }

  // Sidebar Profile Template - Purple sidebar with profile
  if (meta.template === 'sidebarProfile') {
    return <SidebarProfileTemplate {...templateProps} />;
  }

  // Minimal Elegant Template - Clean, sophisticated design
  if (meta.template === 'minimalElegant') {
    return <MinimalElegantTemplate {...templateProps} />;
  }

  // Creative Layout Template - Bold, modern with patterns
  if (meta.template === 'creativeLayout') {
    return <CreativeLayoutTemplate {...templateProps} />;
  }

  // Corporate Template - Dark header, professional
  if (meta.template === 'corporate') {
    return <CorporateTemplate {...templateProps} />;
  }

  // Split Layout Template - Diagonal color split
  if (meta.template === 'splitLayout') {
    return <SplitLayoutTemplate {...templateProps} />;
  }

  // Default fallback template
  return <DefaultTemplate {...templateProps} />;
};
