"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { CoverLetterMeta, ContentSection } from "@/types/coverLetter";

interface Element {
  id: string;
  type: 'name' | 'contact' | 'recipient' | 'company' | 'date' | 'greeting' | 'content' | 'closing' | 'signature';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  visible: boolean;
}

interface FreeformEditorProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  onElementSelect?: (elementId: string | null) => void;
  contentSections?: ContentSection[];
  headerElements?: any[];
  setHeaderElements?: any;
  renderStructuredContent?: React.ReactNode;
  onHeaderElementClick?: (elementId: string, currentValue: string) => void;
  editingElementId?: string | null;
}

export const FreeformEditor = ({ 
  meta, 
  setMeta, 
  content, 
  setContent, 
  onElementSelect, 
  contentSections = [],
  headerElements = [],
  setHeaderElements,
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId
}: FreeformEditorProps) => {
  
  // Initialize elements with default positions for moderngradient template
  const getDefaultElements = (): Element[] => [
    {
      id: 'name',
      type: 'name',
      x: 50,
      y: 50,
      width: 400,
      height: 60,
      content: meta.yourName || 'Your Name',
      fontSize: 32,
      fontWeight: 'bold',
      color: '#ffffff',
      visible: true
    },
    {
      id: 'contact',
      type: 'contact',
      x: 50,
      y: 140,
      width: 600,
      height: 40,
      content: meta.contactLine || 'Phone • Address • Email • LinkedIn',
      fontSize: 14,
      fontWeight: 'normal',
      color: '#ffffff',
      visible: meta.showContactInfo
    },
    {
      id: 'recipient',
      type: 'recipient',
      x: 500,
      y: 50,
      width: 300,
      height: 40,
      content: meta.recipientName || 'Hiring Manager',
      fontSize: 18,
      fontWeight: 'semibold',
      color: '#ffffff',
      visible: meta.showRecipientInfo
    },
    {
      id: 'company',
      type: 'company',
      x: 500,
      y: 100,
      width: 300,
      height: 40,
      content: meta.companyName || 'Company Name',
      fontSize: 16,
      fontWeight: 'medium',
      color: '#ffffff',
      visible: meta.showCompanyInfo
    },
    {
      id: 'date',
      type: 'date',
      x: 50,
      y: 220,
      width: 200,
      height: 30,
      content: meta.date || new Date().toLocaleDateString(),
      fontSize: 14,
      fontWeight: 'normal',
      color: '#666666',
      visible: meta.showDate
    },
    {
      id: 'greeting',
      type: 'greeting',
      x: 50,
      y: 270,
      width: 694, // A4 width (794px) minus margins (50px each side)
      height: 30,
      content: meta.greeting || 'Dear Hiring Manager,',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#1e293b',
      visible: true
    },
    {
      id: 'content',
      type: 'content',
      x: 50,
      y: 320,
      width: 694, // A4 width (794px) minus margins (50px each side)
      height: 300, // Will be calculated dynamically
      content: content || 'Your cover letter content goes here...',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#334155',
      visible: true
    },
    {
      id: 'closing',
      type: 'closing',
      x: 50,
      y: 650, // Will be repositioned dynamically
      width: 694, // A4 width (794px) minus margins (50px each side)
      height: 30,
      content: meta.closing || 'Sincerely,',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#1e293b',
      visible: true
    },
    {
      id: 'signature',
      type: 'signature',
      x: 50,
      y: 690, // Will be repositioned dynamically
      width: 200,
      height: 30,
      content: meta.signatureName || 'Your Name',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1e293b',
      visible: true
    }
  ];

  const [elements, setElements] = useState<Element[]>(getDefaultElements());
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [localEditingElementId, setLocalEditingElementId] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if two elements overlap (with padding)
  const elementsOverlap = (element1: Element, element2: Element, padding: number = 5) => {
    return !(
      element1.x + element1.width + padding < element2.x ||
      element2.x + element2.width + padding < element1.x ||
      element1.y + element1.height + padding < element2.y ||
      element2.y + element2.height + padding < element1.y
    );
  };

  // Calculate dynamic height for content based on text length
  const calculateContentHeight = (text: string, fontSize: number = 16, width: number = 694) => {
    if (!text || text.trim() === '') return 100; // Minimum height
    
    // Estimate lines based on text length and width
    const avgCharsPerLine = Math.floor(width / (fontSize * 0.6)); // Rough estimate
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    let totalLines = 0;
    
    paragraphs.forEach(paragraph => {
      const lines = Math.ceil(paragraph.length / avgCharsPerLine);
      totalLines += Math.max(1, lines); // At least 1 line per paragraph
    });
    
    // Add some padding and return reasonable bounds
    const calculatedHeight = totalLines * fontSize * 1.5; // Line height of 1.5
    return Math.max(100, Math.min(800, calculatedHeight)); // Between 100px and 800px
  };

  // Auto-position elements to prevent overlap
  const autoPositionElements = useCallback(() => {
    setElements(prev => {
      const visibleElements = prev.filter(el => el.visible);
      
      // Special handling: position closing and signature after content
      const contentElement = visibleElements.find(el => el.id === 'content');
      const closingElement = visibleElements.find(el => el.id === 'closing');
      const signatureElement = visibleElements.find(el => el.id === 'signature');
      
      if (contentElement && closingElement && signatureElement) {
        // Position closing right after content
        const newClosingY = contentElement.y + contentElement.height + 20; // 20px gap
        closingElement.y = newClosingY;
        
        // Position signature right after closing
        const newSignatureY = closingElement.y + closingElement.height + 20; // 20px gap
        signatureElement.y = newSignatureY;
      }
      
      // Sort all elements by Y position for overlap detection
      const sortedElements = [...visibleElements].sort((a, b) => a.y - b.y);
      const positionedElements: Element[] = [];
      
      for (const element of sortedElements) {
        let newY = element.y;
        let attempts = 0;
        const maxAttempts = 200;
        const stepSize = 5;
        
        // Keep moving down until no overlap
        while (attempts < maxAttempts) {
          const testElement = { ...element, y: newY };
          const hasOverlap = positionedElements.some(posElement => 
            elementsOverlap(testElement, posElement, 10)
          );
          
          if (!hasOverlap) {
            break;
          }
          
          newY += stepSize;
          attempts++;
        }
        
        positionedElements.push({ ...element, y: newY });
      }
      
      // Update the full elements array with positioned elements
      return prev.map(el => {
        const positioned = positionedElements.find(pos => pos.id === el.id);
        return positioned ? positioned : el;
      });
    });
  }, []);

  // Update elements when meta changes
  useEffect(() => {
    setElements(prev => prev.map(el => {
      switch (el.type) {
        case 'name':
          return { ...el, content: meta.yourName || 'Your Name', visible: true };
        case 'contact':
          return { ...el, content: meta.contactLine || 'Phone • Address • Email • LinkedIn', visible: meta.showContactInfo };
        case 'recipient':
          return { ...el, content: meta.recipientName || 'Hiring Manager', visible: meta.showRecipientInfo };
        case 'company':
          return { ...el, content: meta.companyName || 'Company Name', visible: meta.showCompanyInfo };
        case 'date':
          return { ...el, content: meta.date || new Date().toLocaleDateString(), visible: meta.showDate };
        case 'greeting':
          return { ...el, content: meta.greeting || 'Dear Hiring Manager,', visible: true };
        case 'content':
          // Format content as multiple paragraphs
          const formattedContent = content 
            ? content.split('\n\n').filter(para => para.trim()).join('\n\n')
            : 'Your cover letter content goes here...';
          // Calculate dynamic height based on content
          const dynamicHeight = calculateContentHeight(formattedContent, el.fontSize, el.width);
          return { ...el, content: formattedContent, height: dynamicHeight, visible: true };
        case 'closing':
          return { ...el, content: meta.closing || 'Sincerely,', visible: true };
        case 'signature':
          return { ...el, content: meta.signatureName || 'Your Name', visible: true };
        default:
          return el;
      }
    }));
    
    // Auto-position elements immediately after updating content
    autoPositionElements();
  }, [meta, content]);

  // Force re-render when formatting changes
  useEffect(() => {
    // This effect will trigger a re-render when any formatting properties change
    setElements(prev => [...prev]);
  }, [
    meta.nameFormatting,
    meta.contactFormatting,
    meta.recipientFormatting,
    meta.companyFormatting,
    meta.dateFormatting,
    meta.greetingFormatting,
    meta.contentFormatting,
    meta.closingFormatting,
    meta.signatureFormatting
  ]);

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    // Don't start dragging if clicking on the text content
    if (e.target === e.currentTarget) {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement(elementId);
      setIsDragging(true);
      
      const element = elements.find(el => el.id === elementId);
      if (element) {
        setDragStart({
          x: e.clientX,
          y: e.clientY,
          elementX: element.x,
          elementY: element.y
        });
      }
    }
  }, [elements]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement) return;

      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
    const newX = Math.max(0, dragStart.elementX + deltaX);
    const newY = Math.max(0, dragStart.elementY + deltaY);

    setElements(prev => {
      const updatedElements = prev.map(el => 
        el.id === selectedElement 
          ? { ...el, x: newX, y: newY }
          : el
      );

      // Check for immediate overlaps and adjust if needed
      const draggedElement = updatedElements.find(el => el.id === selectedElement);
      if (draggedElement) {
        const otherElements = updatedElements.filter(el => el.id !== selectedElement && el.visible);
        const hasOverlap = otherElements.some(otherEl => 
          elementsOverlap(draggedElement, otherEl, 5)
        );

        if (hasOverlap) {
          // Move the dragged element down slightly to show it's overlapping
          return updatedElements.map(el => 
        el.id === selectedElement 
              ? { ...el, y: newY + 2 } // Slight offset to show overlap
              : el
          );
        }
      }

      return updatedElements;
    });
  }, [isDragging, selectedElement, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Auto-position elements immediately after dragging to prevent overlap
    autoPositionElements();
  }, [autoPositionElements]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const updateElementContent = useCallback((elementId: string, newContent: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, content: newContent } : el
    ));

    // Update meta or content based on element type
    const element = elements.find(el => el.id === elementId);
    if (element) {
      switch (element.type) {
        case 'name':
          setMeta(prev => ({ ...prev, yourName: newContent }));
          break;
        case 'contact':
          setMeta(prev => ({ ...prev, contactLine: newContent }));
          break;
        case 'recipient':
          setMeta(prev => ({ ...prev, recipientName: newContent }));
          break;
        case 'company':
          setMeta(prev => ({ ...prev, companyName: newContent }));
          break;
        case 'date':
          setMeta(prev => ({ ...prev, date: newContent }));
          break;
        case 'greeting':
          setMeta(prev => ({ ...prev, greeting: newContent }));
          break;
        case 'content':
          setContent(newContent);
          break;
        case 'closing':
          setMeta(prev => ({ ...prev, closing: newContent }));
          break;
        case 'signature':
          setMeta(prev => ({ ...prev, signatureName: newContent }));
          break;
      }
    }
  }, [elements, setMeta, setContent]);

  const updateElementStyle = useCallback((elementId: string, styleUpdates: Partial<Pick<Element, 'fontSize' | 'fontWeight' | 'color'>>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...styleUpdates } : el
    ));
  }, []);

  // Run auto-positioning immediately on mount to fix initial overlaps
  useEffect(() => {
    autoPositionElements();
  }, []);

  const getElementStyle = (element: Element) => {
    // Get formatting from contentSections for content elements
    const section = contentSections.find(s => s.id === element.id);
    
    // Get formatting from meta for header elements and FreeformEditor elements
    let formatting = null;
    if (['name', 'contact', 'recipient', 'company', 'date', 'greeting', 'closing', 'signature', 'content'].includes(element.id)) {
      formatting = meta[`${element.id}Formatting` as keyof typeof meta] as any;
    }
    
    return {
      fontSize: element.fontSize,
      fontWeight: (section?.isBold || formatting?.isBold) ? 'bold' : element.fontWeight,
      color: (section?.fontColor || formatting?.fontColor) || element.color,
      fontStyle: (section?.isItalic || formatting?.isItalic) ? 'italic' : 'normal',
      textDecoration: (section?.isUnderlined || formatting?.isUnderlined) ? 'underline' : 'none'
    };
  };

  const getSectionLabel = (elementId: string) => {
    const labels: Record<string, string> = {
      name: 'Your Name',
      contact: 'Contact Info',
      recipient: 'Recipient Name',
      company: 'Company Name',
      date: 'Date',
      greeting: 'Greeting',
      content: 'Main Content',
      closing: 'Closing',
      signature: 'Signature'
    };
    return labels[elementId] || elementId;
  };

  // Expose the updateElementStyle function and current element for the inline editor
  useEffect(() => {
    if (onHeaderElementClick) {
      // Make updateElementStyle available to parent component
      (window as any).updateElementStyle = updateElementStyle;
      // Make current element available for styling controls
      (window as any).getCurrentElement = () => {
        const currentElement = elements.find(el => el.id === (editingElementId || localEditingElementId));
        return currentElement ? {
          id: currentElement.id,
          fontSize: currentElement.fontSize,
          fontWeight: currentElement.fontWeight,
          color: currentElement.color
        } : null;
      };
    }
  }, [updateElementStyle, onHeaderElementClick, elements, editingElementId, localEditingElementId]);

  // Calculate total height needed based on all elements
  const calculateTotalHeight = () => {
    const visibleElements = elements.filter(el => el.visible);
    if (visibleElements.length === 0) return 900; // Default fallback
    
    const maxBottom = Math.max(...visibleElements.map(el => el.y + el.height));
    return Math.max(900, maxBottom + 100); // Add 100px padding at bottom
  };

  const totalHeight = calculateTotalHeight();

  return (
    <div className="relative" style={{ width: '794px', maxWidth: '794px', height: `${totalHeight}px` }}>
      {/* Gradient Background */}
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
          height: `${totalHeight - 200}px`
        }}
      />
      
      {/* Draggable Elements */}
      <div 
        ref={containerRef}
        className="relative h-full"
        style={{ width: '794px', maxWidth: '794px' }}
        onClick={(e) => {
          // Only deselect if clicking on the container itself, not on elements
          if (e.target === e.currentTarget) {
            setSelectedElement(null);
            if (onElementSelect) {
              onElementSelect(null);
            }
          }
        }}
      >
        {elements.filter(el => el.visible).map(element => (
          <div
            key={element.id}
            className={`absolute cursor-move transition-all ${
              selectedElement === element.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            } hover:ring-1 hover:ring-gray-400 hover:ring-opacity-30`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              fontFamily: 'Inter, sans-serif',
              ...getElementStyle(element)
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            onMouseEnter={() => setHoveredElement(element.id)}
            onMouseLeave={() => setHoveredElement(null)}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element.id);
              if (onElementSelect) {
                onElementSelect(element.id);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setSelectedElement(element.id);
              if (onElementSelect) {
                onElementSelect(element.id);
              }
            }}
          >
            {(editingElementId === element.id || localEditingElementId === element.id) ? (
              element.type === 'content' ? (
                <textarea
                  value={element.content}
                  onChange={(e) => updateElementContent(element.id, e.target.value)}
                  className="w-full h-full bg-white border border-blue-500 rounded px-2 py-1 outline-none resize-none"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    ...getElementStyle(element)
                  }}
                  autoFocus
                  onBlur={() => {
                    setLocalEditingElementId(null);
                    setSelectedElement(null);
                    if (onElementSelect) {
                      onElementSelect(null);
                    }
                  }}
                />
              ) : (
                <input
                  type="text"
                  value={element.content}
                  onChange={(e) => updateElementContent(element.id, e.target.value)}
                  className="w-full h-full bg-white border border-blue-500 rounded px-2 py-1 outline-none"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    ...getElementStyle(element)
                  }}
                  autoFocus
                  onBlur={() => {
                    setLocalEditingElementId(null);
                    setSelectedElement(null);
                    if (onElementSelect) {
                      onElementSelect(null);
                    }
                  }}
                />
              )
            ) : (
              element.type === 'content' ? (
                <div 
                  className="select-none cursor-text hover:opacity-80 transition-opacity whitespace-pre-wrap"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '1.6',
                    ...getElementStyle(element)
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocalEditingElementId(element.id);
                    setSelectedElement(element.id);
                    if (onElementSelect) {
                      onElementSelect(element.id);
                    }
                    if (onHeaderElementClick) {
                      onHeaderElementClick(element.id, element.content);
                    }
                  }}
                >
                  {element.content}
                </div>
              ) : (
                <span 
                  className="select-none cursor-text hover:opacity-80 transition-opacity"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    ...getElementStyle(element)
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLocalEditingElementId(element.id);
                    setSelectedElement(element.id);
                    if (onElementSelect) {
                      onElementSelect(element.id);
                    }
                    if (onHeaderElementClick) {
                      onHeaderElementClick(element.id, element.content);
                    }
                  }}
                >
                  {element.content}
                </span>
              )
            )}
            
            {/* Section Label on Hover */}
            {hoveredElement === element.id && (
              <div 
                className="absolute -top-8 left-0 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-10"
                style={{
                  fontFamily: 'Inter, sans-serif'
                }}
              >
                {getSectionLabel(element.id)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
