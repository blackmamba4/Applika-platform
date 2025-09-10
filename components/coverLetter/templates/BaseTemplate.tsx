// components/coverLetter/templates/BaseTemplate.tsx
"use client";

import { GripVertical } from "lucide-react";
import type { CoverLetterMeta, HeaderElement } from "@/types/coverLetter";

interface BaseTemplateProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  headerElements: HeaderElement[];
  setHeaderElements: React.Dispatch<React.SetStateAction<HeaderElement[]>>;
  renderStructuredContent: React.ReactNode;
}

export const BaseTemplate = ({
  meta,
  setMeta,
  headerElements,
  setHeaderElements,
  renderStructuredContent
}: BaseTemplateProps) => {
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

    return (
      <div
        key={elementId}
        className={`group relative hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all ${className}`}
        draggable
        onDragStart={(e) => handleDragStart(e, elementId)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, elementId)}
      >
        <div className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors">
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
    DensityWrapper
  };
};
