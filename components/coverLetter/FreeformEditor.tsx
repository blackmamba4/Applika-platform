"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { CoverLetterMeta, ContentSection } from "@/types/coverLetter";

interface Element {
  id: string;
  type: 'name' | 'title' | 'contact' | 'recipient' | 'company' | 'date' | 'greeting' | 'content' | 'closing' | 'signature' | 'custom';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign?: 'left' | 'center' | 'right';
  visible: boolean;
}

interface FreeformEditorProps {
  meta: CoverLetterMeta;
  setMeta: React.Dispatch<React.SetStateAction<CoverLetterMeta>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  onElementSelect?: (elementId: string | null) => void;
  contentSections?: ContentSection[];
  renderStructuredContent?: React.ReactNode;
  onHeaderElementClick?: (elementId: string | null, currentValue?: string) => void;
  editingElementId?: string | null;
  onElementsChange?: (elements: Element[]) => void; // Expose elements to parent
}

export const FreeformEditor = ({ 
  meta, 
  setMeta, 
  content, 
  setContent, 
  onElementSelect, 
  contentSections = [],
  renderStructuredContent,
  onHeaderElementClick,
  editingElementId,
  onElementsChange
}: FreeformEditorProps) => {
  
  // Initialize elements with default positions for moderngradient template
  const getDefaultElements = (): Element[] => {
    // Get saved states from meta
    const savedVisibility = meta.elementVisibility || {};
    const savedPositions = meta.elementPositions || {};
    const savedStyles = meta.elementStyles || {};
    
    return [
    {
      id: 'name',
      type: 'name',
      x: savedPositions['name']?.x ?? 50,
      y: savedPositions['name']?.y ?? 30,
      width: savedPositions['name']?.width ?? 400,
      height: savedPositions['name']?.height ?? 40,
      content: meta.yourName || 'Your Name',
      fontSize: savedStyles['name']?.fontSize ?? 28,
      fontWeight: savedStyles['name']?.fontWeight ?? 'bold',
      color: savedStyles['name']?.color ?? '#ffffff',
      textAlign: savedStyles['name']?.textAlign ?? 'left',
      visible: savedVisibility['name'] !== undefined ? savedVisibility['name'] : true
    },
    {
      id: 'title',
      type: 'title',
      x: savedPositions['title']?.x ?? 50,
      y: savedPositions['title']?.y ?? 75,
      width: savedPositions['title']?.width ?? 400,
      height: savedPositions['title']?.height ?? 30,
      content: meta.yourTitle || 'Your Title',
      fontSize: savedStyles['title']?.fontSize ?? 16,
      fontWeight: savedStyles['title']?.fontWeight ?? 'bold',
      color: savedStyles['title']?.color ?? '#ffffff',
      textAlign: savedStyles['title']?.textAlign ?? 'left',
      visible: savedVisibility['title'] !== undefined ? savedVisibility['title'] : true
    },
    {
      id: 'contact',
      type: 'contact',
      x: savedPositions['contact']?.x ?? 50,
      y: savedPositions['contact']?.y ?? 120,
      width: savedPositions['contact']?.width ?? 600,
      height: savedPositions['contact']?.height ?? 60,
      content: meta.contactLine || 'Phone • Address • Email • LinkedIn',
      fontSize: savedStyles['contact']?.fontSize ?? 14,
      fontWeight: savedStyles['contact']?.fontWeight ?? 'normal',
      color: savedStyles['contact']?.color ?? '#ffffff',
      textAlign: savedStyles['contact']?.textAlign ?? 'left',
      visible: savedVisibility['contact'] !== undefined ? savedVisibility['contact'] : true
    },
    {
      id: 'recipient',
      type: 'recipient',
      x: savedPositions['recipient']?.x ?? 50,
      y: savedPositions['recipient']?.y ?? 220,
      width: savedPositions['recipient']?.width ?? 300,
      height: savedPositions['recipient']?.height ?? 80,
      content: meta.recipientName || 'Recipient Name\nRecipient Address\nRecipient Phone\nRecipient Email',
      fontSize: savedStyles['recipient']?.fontSize ?? 14,
      fontWeight: savedStyles['recipient']?.fontWeight ?? 'normal',
      color: savedStyles['recipient']?.color ?? '#1e293b',
      textAlign: savedStyles['recipient']?.textAlign ?? 'left',
      visible: savedVisibility['recipient'] !== undefined ? savedVisibility['recipient'] : (meta.template !== 'moderngradient')
    },
    {
      id: 'company',
      type: 'company',
      x: savedPositions['company']?.x ?? 500,
      y: savedPositions['company']?.y ?? 50,
      width: savedPositions['company']?.width ?? 250,
      height: savedPositions['company']?.height ?? 40,
      content: meta.companyName || 'Company Name',
      fontSize: savedStyles['company']?.fontSize ?? 16,
      fontWeight: savedStyles['company']?.fontWeight ?? 'medium',
      color: savedStyles['company']?.color ?? '#ffffff',
      textAlign: savedStyles['company']?.textAlign ?? 'right',
      visible: savedVisibility['company'] !== undefined ? savedVisibility['company'] : true
    },
    {
      id: 'date',
      type: 'date',
      x: savedPositions['date']?.x ?? 50,
      y: savedPositions['date']?.y ?? 320,
      width: savedPositions['date']?.width ?? 200,
      height: savedPositions['date']?.height ?? 30,
      content: meta.date || 'Date',
      fontSize: savedStyles['date']?.fontSize ?? 14,
      fontWeight: savedStyles['date']?.fontWeight ?? 'normal',
      color: savedStyles['date']?.color ?? '#666666',
      textAlign: savedStyles['date']?.textAlign ?? 'right',
      visible: savedVisibility['date'] !== undefined ? savedVisibility['date'] : true
    },
    {
      id: 'greeting',
      type: 'greeting',
      x: savedPositions['greeting']?.x ?? 50,
      y: savedPositions['greeting']?.y ?? 370,
      width: savedPositions['greeting']?.width ?? 694, // A4 width (794px) minus margins (50px each side)
      height: savedPositions['greeting']?.height ?? 30,
      content: meta.greeting || 'Dear Hiring Manager,',
      fontSize: savedStyles['greeting']?.fontSize ?? 16,
      fontWeight: savedStyles['greeting']?.fontWeight ?? 'normal',
      color: savedStyles['greeting']?.color ?? '#1e293b',
      textAlign: savedStyles['greeting']?.textAlign ?? 'left',
      visible: savedVisibility['greeting'] !== undefined ? savedVisibility['greeting'] : true
    },
    {
      id: 'content',
      type: 'content',
      x: savedPositions['content']?.x ?? 50,
      y: savedPositions['content']?.y ?? 420,
      width: savedPositions['content']?.width ?? 694, // A4 width (794px) minus margins (50px each side)
      height: savedPositions['content']?.height ?? 300, // Will be calculated dynamically
      content: content || 'Your cover letter content goes here...',
      fontSize: savedStyles['content']?.fontSize ?? 16,
      fontWeight: savedStyles['content']?.fontWeight ?? 'normal',
      color: savedStyles['content']?.color ?? '#334155',
      textAlign: savedStyles['content']?.textAlign ?? 'left',
      visible: savedVisibility['content'] !== undefined ? savedVisibility['content'] : true
    },
    {
      id: 'closing',
      type: 'closing',
      x: savedPositions['closing']?.x ?? 50,
      y: savedPositions['closing']?.y ?? 750, // Will be repositioned dynamically
      width: savedPositions['closing']?.width ?? 694, // A4 width (794px) minus margins (50px each side)
      height: savedPositions['closing']?.height ?? 30,
      content: meta.closing || 'Sincerely,',
      fontSize: savedStyles['closing']?.fontSize ?? 16,
      fontWeight: savedStyles['closing']?.fontWeight ?? 'normal',
      color: savedStyles['closing']?.color ?? '#1e293b',
      textAlign: savedStyles['closing']?.textAlign ?? 'left',
      visible: savedVisibility['closing'] !== undefined ? savedVisibility['closing'] : true
    },
    {
      id: 'signature',
      type: 'signature',
      x: savedPositions['signature']?.x ?? 50,
      y: savedPositions['signature']?.y ?? 790, // Will be repositioned dynamically
      width: savedPositions['signature']?.width ?? 200,
      height: savedPositions['signature']?.height ?? 30,
      content: meta.signatureName || 'Your Name',
      fontSize: savedStyles['signature']?.fontSize ?? 16,
      fontWeight: savedStyles['signature']?.fontWeight ?? 'bold',
      color: savedStyles['signature']?.color ?? '#1e293b',
      textAlign: savedStyles['signature']?.textAlign ?? 'left',
      visible: savedVisibility['signature'] !== undefined ? savedVisibility['signature'] : true
    }
  ];
  };

  const [elements, setElements] = useState<Element[]>(getDefaultElements());
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, elementWidth: 0, elementHeight: 0 });
  const [dragStarted, setDragStarted] = useState(false); // Track if we started a drag operation
  const [localEditingElementId, setLocalEditingElementId] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [customTextBoxId, setCustomTextBoxId] = useState<number>(0);
  const [showHiddenElements, setShowHiddenElements] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Function to add a custom text box
  const addCustomTextBox = useCallback((x: number, y: number) => {
    const newId = `custom-${customTextBoxId}`;
    const newElement: Element = {
      id: newId,
      type: 'custom',
      x: x,
      y: y,
      width: 200,
      height: 30,
      content: 'Custom Text',
      fontSize: 16,
      fontWeight: 'normal',
      color: '#1e293b',
      visible: true
    };
    
    setElements(prev => [...prev, newElement]);
    setCustomTextBoxId(prev => prev + 1);
    setSelectedElement(newId);
  }, [customTextBoxId]);

  // Function to remove a custom text box
  const removeCustomTextBox = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // Function to show hidden elements
  const showHiddenElement = useCallback((elementId: string) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, visible: true } : el
    ));
  }, []);

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

  // Update elements when meta changes (preserve visibility state)
  useEffect(() => {
    setElements(prev => prev.map(el => {
      switch (el.type) {
        case 'name':
          return { ...el, content: meta.yourName || 'Your Name' };
        case 'title':
          return { ...el, content: meta.yourTitle || 'Your Title' };
        case 'contact':
          return { ...el, content: meta.contactLine || 'Phone • Address • Email • LinkedIn' };
        case 'recipient':
          return { ...el, content: meta.recipientName || 'Recipient Name\nRecipient Address\nRecipient Phone\nRecipient Email' };
        case 'company':
          return { ...el, content: meta.companyName || 'Company Name' };
        case 'date':
          return { ...el, content: meta.date || 'Date' };
        case 'greeting':
          return { ...el, content: meta.greeting || 'Dear Hiring Manager,' };
        case 'content':
          // Format content as multiple paragraphs
          const formattedContent = content 
            ? content.split('\n\n').filter(para => para.trim()).join('\n\n')
            : 'Your cover letter content goes here...';
          // Calculate dynamic height based on content
          const dynamicHeight = calculateContentHeight(formattedContent, el.fontSize, el.width);
          return { ...el, content: formattedContent, height: dynamicHeight };
        case 'closing':
          return { ...el, content: meta.closing || 'Sincerely,' };
        case 'signature':
          return { ...el, content: meta.signatureName || 'Your Name' };
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

  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string, isResizeHandle?: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement(elementId);
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    if (isResizeHandle) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        elementWidth: element.width,
        elementHeight: element.height
      });
    } else {
      // For content elements, allow dragging even if target !== currentTarget
      // because content elements have inner text divs that can be clicked
      const shouldStartDrag = e.target === e.currentTarget || element.type === 'content';
      
      if (shouldStartDrag) {
        setIsDragging(true);
        setDragStarted(true);
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
    if (!selectedElement) return;

    if (isDragging) {
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
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(50, resizeStart.elementWidth + deltaX);
      const newHeight = Math.max(20, resizeStart.elementHeight + deltaY);

      setElements(prev => prev.map(el => 
        el.id === selectedElement 
          ? { ...el, width: newWidth, height: newHeight }
          : el
      ));
    }
  }, [isDragging, isResizing, selectedElement, dragStart, resizeStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setDragStarted(false);
    // Auto-position elements immediately after dragging to prevent overlap
    autoPositionElements();
  }, [autoPositionElements]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

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
        case 'title':
          setMeta(prev => ({ ...prev, yourTitle: newContent }));
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
        case 'custom':
          // Custom elements just update their content directly
          setElements(prev => prev.map(el => 
            el.id === elementId ? { ...el, content: newContent } : el
          ));
          break;
      }
    }
  }, [elements, setMeta, setContent]);

  const updateElementStyle = useCallback((elementId: string, styleUpdates: Partial<Pick<Element, 'fontSize' | 'fontWeight' | 'color' | 'textAlign'>>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...styleUpdates } : el
    ));
    
    // Also update the meta object for persistent formatting
    if (['name', 'title', 'contact', 'recipient', 'company', 'date', 'greeting', 'closing', 'signature', 'content'].includes(elementId)) {
      const formattingKey = `${elementId}Formatting` as keyof typeof meta;
      
      // Map color to fontColor for the inline editor and preserve textAlign
      const metaUpdates: any = { ...styleUpdates };
      if (styleUpdates.color) {
        metaUpdates.fontColor = styleUpdates.color;
        delete metaUpdates.color; // Remove the color property as it's not used in meta
      }
      // Keep textAlign as is for meta storage
      
      setMeta(prev => ({
        ...prev,
        [formattingKey]: {
          ...(prev[formattingKey] as any || {}),
          ...metaUpdates
        }
      }));
    }
  }, [setMeta]);

  // Run auto-positioning immediately on mount to fix initial overlaps
  useEffect(() => {
    autoPositionElements();
  }, []);

  const getElementStyle = (element: Element) => {
    // Get formatting from contentSections for content elements
    const section = contentSections.find(s => s.id === element.id);
    
    // Get formatting from meta for header elements and FreeformEditor elements
    let formatting = null;
    if (['name', 'title', 'contact', 'recipient', 'company', 'date', 'greeting', 'closing', 'signature', 'content'].includes(element.id)) {
      formatting = meta[`${element.id}Formatting` as keyof typeof meta] as any;
    }
    
    // Apply formatting with proper fallbacks
    const finalColor = formatting?.color || formatting?.fontColor || element.color;
    const finalFontSize = formatting?.fontSize || element.fontSize;
    const finalFontWeight = (section?.isBold || formatting?.isBold) ? 'bold' : 
                           (formatting?.fontWeight || element.fontWeight);
    
    // Get text alignment from section, formatting, or element styles - prioritize formatting from meta
    const textAlign = formatting?.textAlign || section?.textAlign || meta.elementStyles?.[element.id]?.textAlign || 'left';
    
    const styles = {
      fontSize: finalFontSize,
      fontWeight: finalFontWeight,
      color: finalColor,
      fontStyle: (section?.isItalic || formatting?.isItalic) ? 'italic' : 'normal',
      textDecoration: (section?.isUnderlined || formatting?.isUnderlined) ? 'underline' : 'none',
      textAlign: textAlign as 'left' | 'center' | 'right' // Apply text alignment directly
    };
    
    
    return styles;
  };

  const getElementPositionStyle = (element: Element) => {
    // Get formatting from contentSections for content elements
    const section = contentSections.find(s => s.id === element.id);
    const alignment = section?.textAlign || 'left';
    
    // Calculate positioning based on alignment
    let justifyContent = 'flex-start';
    if (alignment === 'center') {
      justifyContent = 'center';
    } else if (alignment === 'right') {
      justifyContent = 'flex-end';
    }
    
        return {
      display: 'flex',
      justifyContent,
      alignItems: 'flex-start',
      width: '100%',
      height: '100%'
    };
  };

  const getSectionLabel = (elementId: string) => {
    if (elementId.startsWith('custom-')) {
      return 'Custom Text Box';
    }
    
    const labels: Record<string, string> = {
      name: 'Your Name',
      title: 'Your Title',
      contact: 'Contact Information',
      recipient: 'Recipient Information',
      company: 'Company Information',
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
      // Make addCustomTextBox available to parent component
      (window as any).addCustomTextBox = () => {
        // Add text box in center of current view
        const centerX = 400;
        const centerY = 400;
        addCustomTextBox(centerX, centerY);
      };
      // Make toggleElementVisibility available to parent component
      (window as any).toggleElementVisibility = (elementId: string) => {
        setElements(prev => prev.map(el => 
          el.id === elementId ? { ...el, visible: !el.visible } : el
        ));
      };
    }
  }, [updateElementStyle, onHeaderElementClick, editingElementId, localEditingElementId, addCustomTextBox]);

  // Notify parent component when elements change
  useEffect(() => {
    if (onElementsChange) {
      onElementsChange(elements);
    }
  }, [elements, onElementsChange]);

  // Update meta with element state when elements change
  useEffect(() => {
    const visibilityMap: Record<string, boolean> = {};
    const positionMap: Record<string, { x: number; y: number; width: number; height: number }> = {};
    const styleMap: Record<string, { fontSize: number; fontWeight: string; color: string }> = {};
    
    elements.forEach(element => {
      visibilityMap[element.id] = element.visible;
      positionMap[element.id] = {
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      };
      styleMap[element.id] = {
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        color: element.color,
        textAlign: element.textAlign || 'left'
      };
    });
    
    // Only update if there's a change to avoid infinite loops
    const hasVisibilityChange = JSON.stringify(visibilityMap) !== JSON.stringify(meta.elementVisibility);
    const hasPositionChange = JSON.stringify(positionMap) !== JSON.stringify(meta.elementPositions);
    const hasStyleChange = JSON.stringify(styleMap) !== JSON.stringify(meta.elementStyles);
    
    if (hasVisibilityChange || hasPositionChange || hasStyleChange) {
      setMeta(prev => ({
        ...prev,
        elementVisibility: visibilityMap,
        elementPositions: positionMap,
        elementStyles: styleMap
      }));
    }
  }, [elements, setMeta, meta.elementVisibility, meta.elementPositions, meta.elementStyles]);

  // Notify parent component on initial load
  useEffect(() => {
    if (onElementsChange && elements.length > 0) {
      onElementsChange(elements);
    }
  }, []); // Only run on mount

  // Auto-deselect functionality removed - elements will only deselect when explicitly clicked

  // Calculate total height needed based on all elements
  const calculateTotalHeight = () => {
    const visibleElements = elements.filter(el => el.visible);
    if (visibleElements.length === 0) return 900; // Default fallback
    
    const maxBottom = Math.max(...visibleElements.map(el => el.y + el.height));
    return Math.max(900, maxBottom + 100); // Add 100px padding at bottom
  };

  const totalHeight = calculateTotalHeight();

  return (
    <div className="relative">
      {/* Hidden Elements Toggle */}
      {elements.some(el => !el.visible && el.type !== 'custom') && (
        <div className="absolute -top-10 left-0 z-20">
          <button
            onClick={() => setShowHiddenElements(!showHiddenElements)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded border"
          >
            {showHiddenElements ? 'Hide' : 'Show'} Hidden Elements
          </button>
        </div>
      )}
      
      <div 
        className="relative" 
        style={{ width: '794px', maxWidth: '794px', height: `${totalHeight}px` }}
        onClick={(e) => {
          // Only deselect if clicking on the main container itself
          if (e.target === e.currentTarget) {
            e.stopPropagation();
            setSelectedElement(null);
            setLocalEditingElementId(null);
            if (onElementSelect) {
              onElementSelect(null);
            }
          }
        }}
      >
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
            e.stopPropagation();
            setSelectedElement(null);
            setLocalEditingElementId(null);
            if (onElementSelect) {
              onElementSelect(null);
            }
          }
        }}
      >
        {elements.filter(el => el.visible || (showHiddenElements && el.type !== 'custom')).map(element => (
          <div
            key={element.id}
            data-element-id={element.id}
            className={`absolute cursor-move transition-all ${
              selectedElement === element.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
            } hover:ring-1 hover:ring-gray-400 hover:ring-opacity-30 ${
              !element.visible ? 'opacity-50 bg-gray-100 border-2 border-dashed border-gray-400' : ''
            }`}
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
              // Don't handle click if we started dragging
              if (dragStarted) {
                return;
              }
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
                <div style={{ padding: '10px', height: '100%' }}>
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="w-full h-full border border-blue-500 rounded outline-none resize-none pointer-events-auto"
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      padding: '5px',
                      backgroundColor: 'transparent',
                      ...getElementStyle(element)
                    }}
                    dangerouslySetInnerHTML={{ __html: element.content }}
                    onInput={(e) => {
                      const newContent = e.currentTarget.textContent || '';
                      updateElementContent(element.id, newContent);
                    }}
                    // onBlur auto-close functionality removed
                    onMouseDown={(e) => {
                      // Stop propagation to prevent dragging when editing content
                      e.stopPropagation();
                    }}
                  />
                </div>
              ) : (
                <input
                  type="text"
                  value={element.content}
                  onChange={(e) => updateElementContent(element.id, e.target.value)}
                  className="w-full h-full border border-blue-500 rounded px-2 py-1 outline-none"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    backgroundColor: 'transparent',
                    ...getElementStyle(element)
                  }}
                  autoFocus
                  // onBlur auto-close functionality removed
                />
              )
            ) : (
              element.type === 'content' ? (
                <div 
                  className="whitespace-pre-wrap"
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    lineHeight: '1.6',
                    height: '100%',
                    padding: '10px',
                    overflow: 'hidden',
                    ...getElementStyle(element)
                  }}
                  dangerouslySetInnerHTML={{ __html: element.content }}
                />
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
            
            {/* Resize Handle */}
            {selectedElement === element.id && (
              <div
                className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                style={{ transform: 'translate(50%, 50%)' }}
                onMouseDown={(e) => handleMouseDown(e, element.id, true)}
              />
            )}
            
            {/* Hide/Delete Button for All Elements */}
            {selectedElement === element.id && (
              <div
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full cursor-pointer flex items-center justify-center text-xs font-bold hover:bg-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  if (element.type === 'custom') {
                    // Delete custom text boxes
                    removeCustomTextBox(element.id);
                  } else if (!element.visible) {
                    // Show hidden elements
                    showHiddenElement(element.id);
                  } else {
                    // Hide core elements
                    setElements(prev => prev.map(el => 
                      el.id === element.id ? { ...el, visible: false } : el
                    ));
                    setSelectedElement(null);
                    setLocalEditingElementId(null);
                    if (onElementSelect) {
                      onElementSelect(null);
                    }
                  }
                }}
                title={
                  element.type === 'custom' 
                    ? "Delete Custom Text Box" 
                    : !element.visible 
                      ? "Show Element" 
                      : "Hide Element"
                }
              >
                ×
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};
