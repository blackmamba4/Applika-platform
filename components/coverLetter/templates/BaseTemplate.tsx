// components/coverLetter/templates/BaseTemplate.tsx
"use client";

import { GripVertical } from "lucide-react";
import type { CoverLetterMeta, HeaderElement, ContentSection } from "@/types/coverLetter";
import { useColorSystem } from "@/lib/hooks/useColorSystem";

interface BaseTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  contentSections?: ContentSection[];
  renderStructuredContent: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const BaseTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: BaseTemplateProps) => {
  // Initialize color system
  const { getColor, getColorInfo, isAccentElement } = useColorSystem(meta, contentSections);
  
  const getDensityStyles = () => {
    const densityMap = {
      compact: { padding: "16px", lineHeight: "1.4", spacing: "12px" },
      normal: { padding: "24px", lineHeight: "1.6", spacing: "16px" },
      roomy: { padding: "32px", lineHeight: "1.8", spacing: "24px" }
    };
    return densityMap[meta.density];
  };

  const getSpacingValue = () => {
    // Convert sectionSpacing (0-100) to actual spacing values
    const baseSpacing = 16; // Base spacing in pixels
    const maxSpacing = 48; // Maximum spacing in pixels
    const spacing = meta.sectionSpacing || 50; // Default to 50 if not set
    return Math.round(baseSpacing + (spacing / 100) * (maxSpacing - baseSpacing));
  };

  // Unified element styling with smart color resolution
  const getElementStyles = (elementId: string) => {
    // Get formatting from contentSections OR meta (for header elements)
    const section = contentSections.find((s: ContentSection) => s.id === elementId);
    const metaFormatting = meta[`${elementId}Formatting` as keyof typeof meta] as Partial<ContentSection> || {};
    const colorInfo = getColorInfo(elementId);
    
    const styles: React.CSSProperties = {
      fontWeight: (section?.isBold || metaFormatting.isBold) ? 'bold' : 'normal',
      fontStyle: (section?.isItalic || metaFormatting.isItalic) ? 'italic' : 'normal',
      textDecoration: (section?.isUnderlined || metaFormatting.isUnderlined) ? 'underline' : 'none',
      textAlign: `${(section?.textAlign || metaFormatting.textAlign || 'left')} !important` as any,
      paddingTop: (section?.spacingTop || metaFormatting.spacingTop) ? `${section?.spacingTop || metaFormatting.spacingTop}px` : '0',
      paddingBottom: (section?.spacingBottom || metaFormatting.spacingBottom) ? `${section?.spacingBottom || metaFormatting.spacingBottom}px` : '0',
      paddingLeft: (section?.spacingSides || metaFormatting.spacingSides) ? `${section?.spacingSides || metaFormatting.spacingSides}px` : '0',
      paddingRight: (section?.spacingSides || metaFormatting.spacingSides) ? `${section?.spacingSides || metaFormatting.spacingSides}px` : '0'
    };
    
    // Apply color: prioritize custom fontColor from either source, then use color system
    const customFontColor = section?.fontColor || metaFormatting.fontColor;
    if (customFontColor) {
      styles.color = customFontColor; // Custom color takes priority
    } else {
      styles.color = colorInfo.value; // Fall back to color system
    }
    
    return styles;
  };
  
  // Legacy function for backward compatibility
  const getHeaderElementFormatting = (elementId: string) => {
    return getElementStyles(elementId);
  };
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    e.dataTransfer.setData('text/plain', elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    const draggedElementId = e.dataTransfer.getData('text/plain');
    
    if (draggedElementId === targetElementId) return;

    const draggedElement = headerElements.find(e => e.id === draggedElementId);
    const targetElement = headerElements.find(e => e.id === targetElementId);
    
    if (!draggedElement || !targetElement) return;

    const newElements = headerElements.map(element => {
      if (element.id === draggedElementId) {
        return { ...element, order: targetElement.order };
      } else if (element.id === targetElementId) {
        return { ...element, order: draggedElement.order };
      }
      return element;
    });

    setHeaderElements(newElements);
  };

  const renderDraggableHeaderElement = (elementId: string, children: React.ReactNode, className: string = "") => {
    const element = headerElements.find(e => e.id === elementId);
    if (!element || !element.visible) return null;

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      
      if (onHeaderElementClick) {
        // Get the current value based on element type
        let currentValue = '';
        switch (elementId) {
          case 'name':
            currentValue = meta.yourName || '';
            break;
          case 'contact':
            currentValue = meta.contactLine || '';
            break;
          case 'recipient':
            currentValue = meta.recipientName || '';
            break;
          case 'company':
            currentValue = meta.companyName || '';
            break;
          case 'date':
            currentValue = meta.date || '';
            break;
          default:
            currentValue = '';
        }
        onHeaderElementClick(elementId, currentValue);
      }
    };

    return (
      <div
        key={elementId}
        className={`group relative hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all cursor-pointer ${className}`}
        onClick={handleClick}
        data-editable-element="true"
      >
        <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div 
            className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors"
            draggable
            onDragStart={(e) => handleDragStart(e, elementId)}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {children}
      </div>
    );
  };

  const DensityWrapper = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const densityStyles = getDensityStyles();
    return (
      <div 
        className={className}
        style={{ 
          padding: densityStyles.padding,
          lineHeight: densityStyles.lineHeight 
        }}
      >
        {children}
      </div>
    );
  };

  return {
    renderDraggableHeaderElement,
    renderStructuredContent,
    getDensityStyles,
    getSpacingValue,
    getHeaderElementFormatting, // Legacy function
    getElementStyles, // New unified function
    getColor, // Direct color access
    getColorInfo, // Color inheritance info
    isAccentElement, // Check if element uses accent colors
    DensityWrapper
  };
};
