// components/coverLetter/TemplateRenderer.tsx
"use client";

import { 
  ModernGradientTemplate,
  ProfessionalAccentTemplate,
  MinimalElegantTemplate,
  SidebarProfileTemplate,
  DefaultTemplate
} from './templates';
import type { CoverLetterMeta, HeaderElement } from "@/types/coverLetter";

interface TemplateRendererProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  renderStructuredContent: React.ReactNode;
}

export const TemplateRenderer = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  renderStructuredContent
}: TemplateRendererProps) => {
  const templateProps = {
    meta,
    setMeta,
    headerElements,
    setHeaderElements,
    renderStructuredContent
  };

  // Modern Gradient Template
  if (meta.template === 'modernGradient') {
    return <ModernGradientTemplate {...templateProps} />;
  }

  // Professional Accent Template
  if (meta.template === 'professionalAccent') {
    return <ProfessionalAccentTemplate {...templateProps} />;
  }

  // Sidebar Profile Template
  if (meta.template === 'sidebarProfile') {
    return <SidebarProfileTemplate {...templateProps} />;
  }

  // Minimal Elegant Template
  if (meta.template === 'minimalElegant') {
    return <MinimalElegantTemplate {...templateProps} />;
  }

  // Default fallback template
  return <DefaultTemplate {...templateProps} />;
};
