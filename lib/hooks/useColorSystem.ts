// lib/hooks/useColorSystem.ts
"use client";

import { useMemo } from 'react';
import type { CoverLetterMeta, ContentSection, TemplateColorSystem, ColorInheritance } from "@/types/coverLetter";
import { 
  extractTemplateColors, 
  resolveElementColor, 
  isAccentColorElement, 
  getDefaultElementColor,
  getTemplateDefaultAccentColor 
} from "@/lib/color-system";

interface UseColorSystemReturn {
  getColor: (elementId: string) => string;
  getColorInfo: (elementId: string) => ColorInheritance;
  isAccentElement: (elementId: string) => boolean;
  templateColors: TemplateColorSystem;
  defaultAccentColor: string;
}

export const useColorSystem = (
  meta: CoverLetterMeta, 
  contentSections: ContentSection[] = []
): UseColorSystemReturn => {
  
  const templateColors = useMemo(() => {
    return extractTemplateColors(meta);
  }, [meta]);

  const defaultAccentColor = useMemo(() => {
    return getTemplateDefaultAccentColor(meta.template);
  }, [meta.template]);

  const getColor = useMemo(() => {
    return (elementId: string): string => {
      const colorInfo = resolveElementColor(
        elementId,
        meta.template,
        templateColors,
        contentSections
      );
      return colorInfo.value;
    };
  }, [meta.template, templateColors, contentSections]);

  const getColorInfo = useMemo(() => {
    return (elementId: string): ColorInheritance => {
      return resolveElementColor(
        elementId,
        meta.template,
        templateColors,
        contentSections
      );
    };
  }, [meta.template, templateColors, contentSections]);

  const isAccentElement = useMemo(() => {
    return (elementId: string): boolean => {
      return isAccentColorElement(elementId, meta.template);
    };
  }, [meta.template]);

  return {
    getColor,
    getColorInfo,
    isAccentElement,
    templateColors,
    defaultAccentColor
  };
};
