"use client";

import { FreeformEditor } from './FreeformEditor';
import ModernGradientTemplate from './templates/ModernGradientTemplate';
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
  content?: string;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
}

export const TemplateRenderer = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId,
  content = "",
  setContent = () => {}
}: TemplateRendererProps) => {
  // Use FreeformEditor for all templates (including moderngradient for draggable functionality)
  return (
    <FreeformEditor
      meta={meta}
      setMeta={setMeta}
      content={content}
      setContent={setContent}
      contentSections={contentSections}
      headerElements={headerElements}
      setHeaderElements={setHeaderElements}
      renderStructuredContent={renderStructuredContent}
      onHeaderElementClick={onHeaderElementClick}
      editingElementId={editingElementId}
    />
  );
};