"use client";

import { FreeformEditor } from './FreeformEditor';
import ModernGradientTemplate from './templates/ModernGradientTemplate';
import type { CoverLetterMeta, ContentSection } from "@/types/coverLetter";

interface TemplateRendererProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string | null, currentValue?: string) => void;
  editingElementId?: string | null;
  content?: string;
  setContent?: React.Dispatch<React.SetStateAction<string>>;
  onElementsChange?: (elements: any[]) => void;
}

export const TemplateRenderer = ({
  meta,
  setMeta,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId,
  content = "",
  setContent = () => {},
  onElementsChange
}: TemplateRendererProps) => {
  // Use FreeformEditor for all templates (including moderngradient for draggable functionality)
  return (
    <FreeformEditor
      meta={meta}
      setMeta={setMeta}
      content={content}
      setContent={setContent}
      contentSections={contentSections}
      renderStructuredContent={renderStructuredContent}
      onHeaderElementClick={onHeaderElementClick}
      onElementSelect={onHeaderElementClick}
      editingElementId={editingElementId}
      onElementsChange={onElementsChange}
    />
  );
};