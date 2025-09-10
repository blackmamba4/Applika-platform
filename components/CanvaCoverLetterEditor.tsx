"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ArrowLeft, Save, Download, Type, Palette, Layout, Plus, Trash2, Copy, Move, GripVertical, Settings, Eye, EyeOff, Upload, Image, Calendar, User, Building, Mail, Phone, MapPin, Sparkles } from "lucide-react";
import { useToast } from "@/components/ToastGlobal";

interface CoverLetterMeta {
  font: "inter" | "poppins" | "montserrat" | "georgia" | "playfair" | "system";
  accent: string;
  company: string;
  density: "compact" | "normal" | "roomy";
  logoUrl: string;
  dateLine: string;
  template: "modernGradient" | "professionalAccent" | "sidebarProfile" | "minimalElegant" | "corporateClassic" | "executiveBold" | "bankingFormal" | "consultingSharp" | "designCreative" | "marketingDynamic" | "startupVibrant" | "techModern" | "healthcareClean" | "educationWarm" | "nonprofitHeart" | "salesEnergetic";
  yourName: string;
  recipient: string;
  contactLine: string;
  footerStyle: "none" | "page" | "initials";
  headerStyle: "nameBlock" | "centered" | "compact";
  showDivider: boolean;
  signatureUrl: string;
  yourInitials: string;
  showSignature: boolean;
  companyAddress: string;
  // Parsed content components
  greeting?: string; // "Dear Red Sift Hiring Team,"
  closing?: string; // "Warm regards,"
  signatureName?: string; // "James"
  gradientColor?: string; // Custom gradient color
  showRecipientBlock: boolean;
}

interface CoverLetterEditorProps {
  letterId: string;
  initialTitle: string;
  initialBody: string;
  initialMeta?: CoverLetterMeta;
  onBackToStep1: () => void;
}

const FONT_OPTIONS = [
  { id: "inter", name: "Inter", value: "Inter, sans-serif" },
  { id: "poppins", name: "Poppins", value: "Poppins, sans-serif" },
  { id: "montserrat", name: "Montserrat", value: "Montserrat, sans-serif" },
  { id: "georgia", name: "Georgia", value: "Georgia, serif" },
  { id: "playfair", name: "Playfair Display", value: "Playfair Display, serif" },
  { id: "system", name: "System", value: "system-ui, sans-serif" },
];

const TEMPLATE_OPTIONS = [
  // Current Templates
  { id: "modernGradient", name: "Modern Gradient", description: "Stunning gradient header with clean typography", icon: "🌈", category: "Modern" },
  { id: "professionalAccent", name: "Professional Accent", description: "Clean design with colored accent block", icon: "💼", category: "Professional" },
  { id: "sidebarProfile", name: "Sidebar Profile", description: "Two-column layout with profile picture", icon: "👤", category: "Layout" },
  { id: "minimalElegant", name: "Minimal Elegant", description: "Sophisticated minimal design", icon: "✨", category: "Minimal" },
  
  // New Professional Templates
  { id: "corporateClassic", name: "Corporate Classic", description: "Traditional corporate format with formal styling", icon: "🏢", category: "Corporate" },
  { id: "executiveBold", name: "Executive Bold", description: "Bold header with executive presence", icon: "👔", category: "Executive" },
  { id: "bankingFormal", name: "Banking Formal", description: "Conservative design for finance industry", icon: "🏦", category: "Finance" },
  { id: "consultingSharp", name: "Consulting Sharp", description: "Clean lines perfect for consulting", icon: "📊", category: "Consulting" },
  
  // Creative Templates
  { id: "designCreative", name: "Design Creative", description: "Bold colors for creative professionals", icon: "🎨", category: "Creative" },
  { id: "marketingDynamic", name: "Marketing Dynamic", description: "Eye-catching design for marketing roles", icon: "📈", category: "Marketing" },
  { id: "startupVibrant", name: "Startup Vibrant", description: "Energetic design for startup culture", icon: "🚀", category: "Startup" },
  { id: "techModern", name: "Tech Modern", description: "Sleek design for tech professionals", icon: "💻", category: "Tech" },
  
  // Industry-Specific Templates
  { id: "healthcareClean", name: "Healthcare Clean", description: "Clean, trustworthy design for healthcare", icon: "🏥", category: "Healthcare" },
  { id: "educationWarm", name: "Education Warm", description: "Approachable design for education sector", icon: "🎓", category: "Education" },
  { id: "nonprofitHeart", name: "Nonprofit Heart", description: "Warm, mission-focused design", icon: "❤️", category: "Nonprofit" },
  { id: "salesEnergetic", name: "Sales Energetic", description: "High-energy design for sales roles", icon: "💪", category: "Sales" },
];

const DENSITY_OPTIONS = [
  { id: "compact", name: "Compact", description: "Tight spacing" },
  { id: "normal", name: "Normal", description: "Standard spacing" },
  { id: "roomy", name: "Roomy", description: "Loose spacing" },
];

const ACCENT_COLORS = [
  { id: "emerald-500", name: "Emerald", value: "#10b981" },
  { id: "indigo-500", name: "Indigo", value: "#6366f1" },
  { id: "violet-500", name: "Violet", value: "#8b5cf6" },
  { id: "rose-500", name: "Rose", value: "#f43f5e" },
  { id: "orange-500", name: "Orange", value: "#f97316" },
  { id: "teal-500", name: "Teal", value: "#14b8a6" },
  { id: "purple-500", name: "Purple", value: "#a855f7" },
  { id: "pink-500", name: "Pink", value: "#ec4899" },
];

// Custom Color Wheel Component
const ColorWheel = ({ value, onChange, label }: { value: string; onChange: (color: string) => void; label: string }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  return (
    <div className="space-y-2 relative">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <div 
          className="w-8 h-8 rounded-full border-2 border-gray-300 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="#000000"
        />
      </div>
      
      {showPicker && (
        <div className="absolute z-50 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="grid grid-cols-8 gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onChange(color.value);
                  setShowPicker(false);
                }}
                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 transition-colors"
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-8 rounded border border-gray-300"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const HEADER_STYLES = [
  { id: "centered", name: "Centered", description: "Name centered at top" },
  { id: "nameBlock", name: "Name Block", description: "Name in a block format" },
  { id: "compact", name: "Compact", description: "Minimal header" },
];

const FOOTER_STYLES = [
  { id: "none", name: "None", description: "No footer" },
  { id: "page", name: "Page Number", description: "Page number at bottom" },
  { id: "initials", name: "Initials", description: "Your initials" },
];

export default function CanvaCoverLetterEditor({
  letterId,
  initialTitle,
  initialBody,
  initialMeta,
  onBackToStep1,
}: CoverLetterEditorProps) {
  const [content, setContent] = useState(initialBody || "Dear Hiring Manager,\n\nI am writing to express my strong interest in the position at your company. With my background and skills, I believe I would be a valuable addition to your team.\n\nIn my previous roles, I have demonstrated strong problem-solving abilities, excellent communication skills, and a passion for delivering high-quality results. I am excited about the opportunity to contribute to your organization's success.\n\nThank you for considering my application. I look forward to hearing from you.\n\nSincerely,\n[Your Name]");
  const [selectedCategory, setSelectedCategory] = useState("Modern");
  
  // Content sections management
  const [contentSections, setContentSections] = useState([
    { id: 'greeting', label: 'Greeting', visible: true, order: 0 },
    { id: 'body', label: 'Body Content', visible: true, order: 1 },
    { id: 'closing', label: 'Closing', visible: true, order: 2 },
    { id: 'signature', label: 'Signature', visible: true, order: 3 }
  ]);

  // Header elements management
  const [headerElements, setHeaderElements] = useState([
    { id: 'name', label: 'Your Name', visible: true, order: 0 },
    { id: 'contact', label: 'Contact Info', visible: true, order: 1 },
    { id: 'recipient', label: 'Recipient', visible: true, order: 2 },
    { id: 'company', label: 'Company Info', visible: true, order: 3 },
    { id: 'date', label: 'Date', visible: true, order: 4 }
  ]);
  
  const [meta, setMeta] = useState<CoverLetterMeta>({
    font: "inter",
    accent: "#f43f5e",
    company: "Company Name",
    density: "normal",
    logoUrl: "",
    dateLine: new Date().toLocaleDateString(),
    template: "modernGradient",
    yourName: "Your Name",
    recipient: "Hiring Manager",
    contactLine: "(555) 123-4567\nyour@email.com\nCity, State\nProfessional Title",
    footerStyle: "none",
    headerStyle: "centered",
    showDivider: true,
    signatureUrl: "",
    yourInitials: "",
    showSignature: false,
    companyAddress: "",
    showRecipientBlock: true,
    ...initialMeta,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "structure" | "design" | "details">("content");
  
  // Inline editing state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  // Inline editing functions
  const startEditing = (sectionId: string, currentValue: string) => {
    setEditingSection(sectionId);
    setEditValue(currentValue);
    
    // For body content, set initial height after a brief delay to ensure DOM is updated
    if (sectionId === 'body') {
      setTimeout(() => {
        const textarea = document.querySelector('textarea[data-editing="body"]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = Math.max(200, textarea.scrollHeight) + 'px';
        }
      }, 10);
    }
  };

  const saveEdit = () => {
    if (editingSection && editValue !== undefined) {
      switch (editingSection) {
        case 'greeting':
          setMeta(prev => ({ ...prev, greeting: editValue }));
          break;
        case 'closing':
          setMeta(prev => ({ ...prev, closing: editValue }));
          break;
        case 'signature':
          setMeta(prev => ({ ...prev, signatureName: editValue }));
          break;
        case 'body':
          setContent(editValue);
          break;
      }
    }
    setEditingSection(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // Parse content to extract structured components
  // Content management functions
  const toggleSectionVisibility = (sectionId: string) => {
    setContentSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    setContentSections(prev => {
      const newSections = [...prev];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      
      // Update order numbers
      return newSections.map((section, index) => ({
        ...section,
        order: index
      }));
    });
  };

  const getSortedSections = () => {
    return [...contentSections].sort((a, b) => a.order - b.order);
  };

  // Calculate where the A4 page break should be positioned
  const getA4PageBreakPosition = () => {
    const charactersPerPage = 800;
    if (content.length <= charactersPerPage) {
      return null; // No page break needed
    }
    
    // Find a good break point (end of sentence or paragraph)
    const firstPageContent = content.substring(0, charactersPerPage);
    const lastSentenceEnd = Math.max(
      firstPageContent.lastIndexOf('.'),
      firstPageContent.lastIndexOf('!'),
      firstPageContent.lastIndexOf('?')
    );
    
    const breakPoint = lastSentenceEnd > charactersPerPage * 0.8 ? lastSentenceEnd + 1 : charactersPerPage;
    
    return {
      firstPageContent: content.substring(0, breakPoint),
      secondPageContent: content.substring(breakPoint),
      breakPoint
    };
  };

  const pageBreakData = getA4PageBreakPosition();

  const toggleHeaderElementVisibility = (elementId: string) => {
    setHeaderElements(prev => 
      prev.map(element => 
        element.id === elementId 
          ? { ...element, visible: !element.visible }
          : element
      )
    );
  };

  const reorderHeaderElements = (fromIndex: number, toIndex: number) => {
    setHeaderElements(prev => {
      const newElements = [...prev];
      const [movedElement] = newElements.splice(fromIndex, 1);
      newElements.splice(toIndex, 0, movedElement);
      
      // Update order numbers
      return newElements.map((element, index) => ({
        ...element,
        order: index
      }));
    });
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, elementId: string, type: 'content' | 'header') => {
    e.dataTransfer.setData('text/plain', `${type}:${elementId}`);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetElementId: string, type: 'content' | 'header') => {
    e.preventDefault();
    const draggedData = e.dataTransfer.getData('text/plain');
    const [draggedType, draggedElementId] = draggedData.split(':');
    
    if (draggedType === type && draggedElementId !== targetElementId) {
      if (type === 'content') {
        const draggedIndex = contentSections.findIndex(s => s.id === draggedElementId);
        const targetIndex = contentSections.findIndex(s => s.id === targetElementId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          reorderSections(draggedIndex, targetIndex);
        }
      } else if (type === 'header') {
        const draggedIndex = headerElements.findIndex(s => s.id === draggedElementId);
        const targetIndex = headerElements.findIndex(s => s.id === targetElementId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          reorderHeaderElements(draggedIndex, targetIndex);
        }
      }
    }
  };

  // Render content based on section visibility and order - memoized
  const renderStructuredContent = useMemo(() => {
    const sortedSections = getSortedSections();
    const visibleSections = sortedSections.filter(section => section.visible);
    
    const elements: React.ReactNode[] = [];
    
    visibleSections.forEach(section => {
      switch (section.id) {
        case 'greeting':
          if (meta.greeting) {
            elements.push(
              <div 
                key="greeting" 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'greeting', 'content')}
                className="mb-4 font-medium hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'greeting', 'content')}
                    className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingSection === 'greeting' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none font-medium"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('greeting', meta.greeting || '')}
                        title="Click to edit"
                      >
                        {meta.greeting}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          break;
        case 'body':
          if (content.trim()) {
            // Show full content as one big editable text block
            elements.push(
              <div 
                key="body" 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'body', 'content')}
                className="mb-6 whitespace-pre-wrap leading-relaxed hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex items-start gap-2">
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'body', 'content')}
                    className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors mt-1 flex-shrink-0"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingSection === 'body' ? (
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none resize-none whitespace-pre-wrap leading-relaxed min-h-[200px]"
                        autoFocus
                        data-editing="body"
                        style={{ 
                          height: 'auto',
                          minHeight: '200px',
                          maxHeight: 'none'
                        }}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.max(200, target.scrollHeight) + 'px';
                        }}
                      />
                    ) : (
                      <div 
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('body', content)}
                        title="Click to edit"
                      >
                        {content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          break;
        case 'closing':
          if (meta.closing) {
            elements.push(
              <div 
                key="closing" 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'closing', 'content')}
                className="mb-2 hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'closing', 'content')}
                    className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingSection === 'closing' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('closing', meta.closing || '')}
                        title="Click to edit"
                      >
                        {meta.closing}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          break;
        case 'signature':
          if (meta.signatureName) {
            elements.push(
              <div 
                key="signature" 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'signature', 'content')}
                className="font-bold hover:bg-gray-50 p-2 rounded border-2 border-transparent hover:border-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div 
                    draggable
                    onDragStart={(e) => handleDragStart(e, 'signature', 'content')}
                    className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors"
                    title="Drag to reorder"
                  >
                    <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1">
                    {editingSection === 'signature' ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveEdit}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none outline-none font-bold"
                        autoFocus
                      />
                    ) : (
                      <div 
                        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded"
                        onClick={() => startEditing('signature', meta.signatureName || '')}
                        title="Click to edit"
                      >
                        {meta.signatureName}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }
          break;
      }
    });
    
    return elements;
  }, [contentSections, meta.greeting, meta.closing, meta.signatureName, content, pageBreakData, editingSection, editValue]);


  // Render draggable header elements
  const renderDraggableHeaderElement = (elementId: string, children: React.ReactNode, className: string = "") => {
    const element = headerElements.find(e => e.id === elementId);
    if (!element || !element.visible) return null;

    return (
      <div
        key={elementId}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, elementId, 'header')}
        className={`hover:bg-gray-50 rounded border-2 border-transparent hover:border-gray-200 transition-all group ${className}`}
      >
        <div className="flex items-center gap-2">
          <div 
            draggable
            onDragStart={(e) => handleDragStart(e, elementId, 'header')}
            className="cursor-move p-1 rounded hover:bg-gray-200 transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 cursor-text">{children}</div>
        </div>
      </div>
    );
  };

  const parseContent = (content: string): { greeting: string; closing: string; signatureName: string } => {
    // Since AI only generates body content, we don't need to parse greeting/closing/signature from content
    // These are set separately in the meta
    return { 
      greeting: meta.greeting || `Dear Hiring Manager,`,
      closing: meta.closing || 'Sincerely,',
      signatureName: meta.signatureName || meta.yourName || 'Your Name'
    };
  };

  // Auto-parse content when it changes - but only for initial setup
  useEffect(() => {
    // Only parse if we don't already have proper meta values
    if (!meta.greeting || !meta.closing || !meta.signatureName) {
      const parsed = parseContent(content);
      setMeta(prev => ({
        ...prev,
        greeting: prev.greeting || parsed.greeting,
        closing: prev.closing || parsed.closing,
        signatureName: prev.signatureName || parsed.signatureName
      }));
    }
  }, [content, meta.greeting, meta.closing, meta.signatureName]);
  const toast = useToast();

  const getFontFamily = () => {
    const font = FONT_OPTIONS.find(f => f.id === meta.font);
    return font?.value || "Inter, sans-serif";
  };

  const getDensityStyles = () => {
    switch (meta.density) {
      case "compact":
        return { lineHeight: "1.3", headerSpacing: "1rem", paragraphSpacing: "0.75rem" };
      case "roomy":
        return { lineHeight: "1.8", headerSpacing: "2rem", paragraphSpacing: "1.5rem" };
      default:
        return { lineHeight: "1.6", headerSpacing: "1.5rem", paragraphSpacing: "1rem" };
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATE_OPTIONS.find(t => t.id === templateId);
    if (!template) return;

    switch (templateId) {
      // Current Templates
      case "modernGradient":
        setMeta(prev => ({
          ...prev,
          template: "modernGradient",
          headerStyle: "centered",
          accent: "#f43f5e",
          density: "normal",
          showDivider: false,
          font: "poppins",
        }));
        break;
      case "professionalAccent":
        setMeta(prev => ({
          ...prev,
          template: "professionalAccent",
          headerStyle: "nameBlock",
          accent: "#14b8a6",
          density: "normal",
          showDivider: true,
          font: "inter",
        }));
        break;
      case "sidebarProfile":
        setMeta(prev => ({
          ...prev,
          template: "sidebarProfile",
          headerStyle: "compact",
          accent: "#a855f7",
          density: "normal",
          showDivider: false,
          font: "montserrat",
        }));
        break;
      case "minimalElegant":
        setMeta(prev => ({
          ...prev,
          template: "minimalElegant",
          headerStyle: "centered",
          accent: "#6366f1",
          density: "roomy",
          showDivider: false,
          font: "playfair",
        }));
        break;

      // New Professional Templates
      case "corporateClassic":
        setMeta(prev => ({
          ...prev,
          template: "corporateClassic",
          headerStyle: "nameBlock",
          accent: "#374151",
          density: "normal",
          showDivider: true,
          font: "georgia",
        }));
        break;
      case "executiveBold":
        setMeta(prev => ({
          ...prev,
          template: "executiveBold",
          headerStyle: "centered",
          accent: "#1f2937",
          density: "roomy",
          showDivider: true,
          font: "playfair",
        }));
        break;
      case "bankingFormal":
        setMeta(prev => ({
          ...prev,
          template: "bankingFormal",
          headerStyle: "nameBlock",
          accent: "#1e40af",
          density: "normal",
          showDivider: true,
          font: "georgia",
        }));
        break;
      case "consultingSharp":
        setMeta(prev => ({
          ...prev,
          template: "consultingSharp",
          headerStyle: "compact",
          accent: "#059669",
          density: "compact",
          showDivider: true,
          font: "inter",
        }));
        break;

      // Creative Templates
      case "designCreative":
        setMeta(prev => ({
          ...prev,
          template: "designCreative",
          headerStyle: "centered",
          accent: "#ec4899",
          density: "normal",
          showDivider: false,
          font: "poppins",
        }));
        break;
      case "marketingDynamic":
        setMeta(prev => ({
          ...prev,
          template: "marketingDynamic",
          headerStyle: "nameBlock",
          accent: "#f59e0b",
          density: "normal",
          showDivider: false,
          font: "montserrat",
        }));
        break;
      case "startupVibrant":
        setMeta(prev => ({
          ...prev,
          template: "startupVibrant",
          headerStyle: "centered",
          accent: "#8b5cf6",
          density: "normal",
          showDivider: false,
          font: "poppins",
        }));
        break;
      case "techModern":
        setMeta(prev => ({
          ...prev,
          template: "techModern",
          headerStyle: "compact",
          accent: "#06b6d4",
          density: "compact",
          showDivider: true,
          font: "inter",
        }));
        break;

      // Industry-Specific Templates
      case "healthcareClean":
        setMeta(prev => ({
          ...prev,
          template: "healthcareClean",
          headerStyle: "nameBlock",
          accent: "#10b981",
          density: "normal",
          showDivider: true,
          font: "georgia",
        }));
        break;
      case "educationWarm":
        setMeta(prev => ({
          ...prev,
          template: "educationWarm",
          headerStyle: "centered",
          accent: "#f97316",
          density: "roomy",
          showDivider: false,
          font: "montserrat",
        }));
        break;
      case "nonprofitHeart":
        setMeta(prev => ({
          ...prev,
          template: "nonprofitHeart",
          headerStyle: "centered",
          accent: "#ef4444",
          density: "normal",
          showDivider: false,
          font: "playfair",
        }));
        break;
      case "salesEnergetic":
        setMeta(prev => ({
          ...prev,
          template: "salesEnergetic",
          headerStyle: "nameBlock",
          accent: "#dc2626",
          density: "normal",
          showDivider: true,
          font: "montserrat",
        }));
        break;
    }
  };

  const saveCoverLetter = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/cover-letters/${letterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: initialTitle,
          content: content,
          meta: meta,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save cover letter");
      }

      toast.show({ message: "Cover letter saved successfully!" });
    } catch (error) {
      console.error("Error saving cover letter:", error);
      toast.show({ message: "Failed to save cover letter" });
    } finally {
      setIsSaving(false);
    }
  };

  const renderCoverLetterForPDF = () => {
    const densityStyles = getDensityStyles();
    const fontFamily = getFontFamily();
    
    // Use the same template rendering as the visual editor, but with print-friendly styles
    if (meta.template === 'modernGradient') {
      return `
        <div style="font-family: ${fontFamily}; line-height: ${densityStyles.lineHeight}; color: #333; width: 210mm; min-height: 297mm; background: white; padding: 0; margin: 0;">
          <!-- Gradient Header -->
          <div style="height: 130px; display: flex; flex-direction: column; align-items: center; color: white; background: linear-gradient(135deg, ${meta.accent} 0%, ${meta.gradientColor || '#f97316'} 100%); padding-top: 20px;">
            <div style="font-size: 24px; font-weight: bold; margin-bottom: 6px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${meta.yourName}</div>
            <div style="width: 64px; height: 1px; background: rgba(255,255,255,0.3); margin-bottom: 16px;"></div>
            <div style="display: flex; gap: 24px; font-size: 14px;">
              <div style="text-align: center;">
                <div style="font-weight: bold; margin-bottom: 8px;">PHONE</div>
                <div>${meta.contactLine?.split('\n')[0] || '(555) 123-4567'}</div>
              </div>
              <div style="text-align: center;">
                <div style="font-weight: bold; margin-bottom: 8px;">EMAIL</div>
                <div>${meta.contactLine?.split('\n')[1] || 'your@email.com'}</div>
              </div>
              <div style="text-align: center;">
                <div style="font-weight: bold; margin-bottom: 8px;">ADDRESS</div>
                <div>${meta.contactLine?.split('\n')[2] || 'City, State'}</div>
              </div>
            </div>
          </div>
          
          <!-- Content Area -->
          <div style="padding: 24px;">
            <!-- Date and Recipient -->
            <div style="margin-bottom: 24px;">
              <div style="font-size: 14px; color: #666; margin-bottom: 8px;">${meta.dateLine}</div>
              <div style="font-weight: 500; margin-bottom: 4px;">${meta.recipient}</div>
              <div style="font-weight: 500; margin-bottom: 4px;">${meta.company}</div>
              ${meta.companyAddress ? `<div style="font-size: 14px; color: #666;">${meta.companyAddress}</div>` : ''}
            </div>
            
            <!-- Greeting -->
            <div style="margin-bottom: 16px; font-weight: 500;">${meta.greeting || `Dear ${meta.company} Team,`}</div>
            
            <!-- Main Content -->
            <div style="white-space: pre-wrap; margin-bottom: 24px; line-height: 1.6;">${content}</div>
            
            <!-- Closing -->
            <div style="margin-bottom: 8px;">${meta.closing || 'Warm regards,'}</div>
            <div style="font-weight: bold;">${meta.signatureName || meta.yourName}</div>
          </div>
        </div>
      `;
    }
    
    // Fallback for other templates - use the same structure as modernGradient
    return `
      <div style="font-family: ${fontFamily}; line-height: ${densityStyles.lineHeight}; color: #333; width: 210mm; min-height: 297mm; background: white; padding: 24px; margin: 0;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px; color: ${meta.accent};">${meta.yourName}</h1>
          <div style="width: 96px; height: 2px; background: ${meta.accent}; margin: 0 auto 24px;"></div>
          <div style="color: #666; font-size: 16px;">${meta.contactLine?.split('\n')[3] || 'Professional Title'}</div>
        </div>
        
        <!-- Date and Recipient -->
        <div style="margin-bottom: 24px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">${meta.dateLine}</div>
          <div style="font-weight: 500; margin-bottom: 4px;">${meta.recipient}</div>
          <div style="font-weight: 500; margin-bottom: 4px;">${meta.company}</div>
          ${meta.companyAddress ? `<div style="font-size: 14px; color: #666;">${meta.companyAddress}</div>` : ''}
        </div>
        
        <!-- Greeting -->
        <div style="margin-bottom: 16px; font-weight: 500;">${meta.greeting || `Dear ${meta.company} Team,`}</div>
        
        <!-- Main Content -->
        <div style="white-space: pre-wrap; margin-bottom: 24px; line-height: 1.6;">${content}</div>
        
        <!-- Closing -->
        <div style="margin-bottom: 8px;">${meta.closing || 'Sincerely,'}</div>
        <div style="font-weight: bold;">${meta.signatureName || meta.yourName}</div>
      </div>
    `;
  };

  // BEAUTIFUL TEMPLATES WITH INLINE EDITING
  const renderCoverLetter = () => {
    const densityStyles = getDensityStyles();
    const fontFamily = getFontFamily();
    
    return (
      <div 
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative mx-auto"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          fontFamily,
          lineHeight: densityStyles.lineHeight,
          color: '#333',
          margin: '0 auto'
        }}
      >
        {/* Template Rendering */}
        {meta.template === 'modernGradient' && (
          <>
            {/* Gradient Header */}
            <div 
              className="relative h-40 flex flex-col justify-center items-center text-white pt-6"
              style={{
                background: `linear-gradient(135deg, ${meta.accent} 0%, ${meta.gradientColor || '#f97316'} 100%)`
              }}
            >
              {/* Draggable Name */}
              {renderDraggableHeaderElement('name', 
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-2xl font-bold mb-2 tracking-wide bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-2 py-1 transition-colors"
                  style={{ 
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    maxWidth: '100%',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  placeholder="Your Name"
                />
              )}
              <div className="w-16 h-px bg-white/30 mb-4"></div>
              {/* Draggable Contact Info */}
              {renderDraggableHeaderElement('contact',
                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold mb-2">PHONE</div>
                    <input
                      type="text"
                      value={meta.contactLine?.split('\n')[0] || '(555) 123-4567'}
                      onChange={(e) => {
                        const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                        lines[0] = e.target.value;
                        setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                      }}
                      className="text-xs opacity-90 bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      placeholder="Phone"
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-2">EMAIL</div>
                    <input
                      type="text"
                      value={meta.contactLine?.split('\n')[1] || 'your@email.com'}
                      onChange={(e) => {
                        const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                        lines[1] = e.target.value;
                        setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                      }}
                      className="text-xs opacity-90 bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      placeholder="Email"
                    />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold mb-2">ADDRESS</div>
                    <input
                      type="text"
                      value={meta.contactLine?.split('\n')[2] || 'City, State'}
                      onChange={(e) => {
                        const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                        lines[2] = e.target.value;
                        setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                      }}
                      className="text-xs opacity-90 bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                      placeholder="Address"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Recipient */}
              <div className="mb-6 space-y-2">
                {renderDraggableHeaderElement('date',
                  <input
                    type="text"
                    value={meta.dateLine}
                    onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                    className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Date"
                  />
                )}
                {renderDraggableHeaderElement('recipient',
                  <input
                    type="text"
                    value={meta.recipient}
                    onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                    className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Recipient"
                  />
                )}
                {renderDraggableHeaderElement('company',
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={meta.company}
                      onChange={(e) => setMeta(prev => ({ ...prev, company: e.target.value }))}
                      className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={meta.companyAddress}
                      onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                      className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                      placeholder="Company Address (optional)"
                    />
                  </div>
                )}
              </div>

              {/* Structured Content */}
              <div className="mb-6 w-full min-h-96">
                {renderStructuredContent}
              </div>
            </div>
          </>
        )}

        {/* Professional Accent Template */}
        {meta.template === 'professionalAccent' && (
          <>
            {/* Header with Accent Block */}
            <div className="flex">
              <div className="flex-1 p-8">
                {renderDraggableHeaderElement('name',
                  <input
                    type="text"
                    value={meta.yourName}
                    onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                    className="text-3xl font-bold mb-2 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    style={{ 
                      color: meta.accent,
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                    placeholder="Your Name"
                  />
                )}
                <input
                  type="text"
                  value={meta.contactLine?.split('\n')[3] || 'Professional Title'}
                  onChange={(e) => {
                    const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                    lines[3] = e.target.value;
                    setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                  }}
                  className="text-lg text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Professional Title"
                />
              </div>
              {renderDraggableHeaderElement('contact',
                <div 
                  className="w-24 flex flex-col justify-center items-center text-white p-4"
                  style={{ backgroundColor: meta.accent }}
                >
                  <div className="text-center">
                    <div className="text-xs font-semibold mb-1">PHONE</div>
                    <input
                      type="text"
                      value={meta.contactLine?.split('\n')[0] || '(555) 123-4567'}
                      onChange={(e) => {
                        const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                        lines[0] = e.target.value;
                        setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                      }}
                      className="text-xs bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                      placeholder="Phone"
                    />
                  </div>
                  <div className="text-center mt-3">
                    <div className="text-xs font-semibold mb-1">EMAIL</div>
                    <input
                      type="text"
                      value={meta.contactLine?.split('\n')[1] || 'your@email.com'}
                      onChange={(e) => {
                        const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                        lines[1] = e.target.value;
                        setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                      }}
                      className="text-xs bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                      placeholder="Email"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mx-8"></div>

            {/* Content */}
            <div className="p-8">
              {/* Recipient */}
              <div className="mb-6 space-y-2">
                {renderDraggableHeaderElement('date',
                  <input
                    type="text"
                    value={meta.dateLine}
                    onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                    className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Date"
                  />
                )}
                {renderDraggableHeaderElement('recipient',
                  <input
                    type="text"
                    value={meta.recipient}
                    onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                    className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Recipient"
                  />
                )}
                {renderDraggableHeaderElement('company',
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={meta.company}
                      onChange={(e) => setMeta(prev => ({ ...prev, company: e.target.value }))}
                      className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                      placeholder="Company"
                    />
                    <input
                      type="text"
                      value={meta.companyAddress}
                      onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                      className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                      placeholder="Company Address (optional)"
                    />
                  </div>
                )}
              </div>

              {/* Structured Content */}
              <div className="mb-6 w-full min-h-96">
                {renderStructuredContent}
              </div>
            </div>
          </>
        )}

        {/* Sidebar Profile Template */}
        {meta.template === 'sidebarProfile' && (
          <div className="flex h-full">
            {/* Left Sidebar */}
            <div 
              className="w-48 p-6 text-white flex flex-col"
              style={{ backgroundColor: meta.accent }}
            >
              {/* Profile Picture */}
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                {meta.logoUrl ? (
                  <img src={meta.logoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="text-2xl font-bold">{meta.yourName?.charAt(0) || 'Y'}</div>
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold mb-1">ADDRESS</div>
                  <input
                    type="text"
                    value={meta.contactLine?.split('\n')[2] || '123 Main Street'}
                    onChange={(e) => {
                      const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                      lines[2] = e.target.value;
                      setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                    }}
                    className="text-xs opacity-90 bg-transparent text-white border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                    placeholder="Address"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">PHONE</div>
                  <input
                    type="text"
                    value={meta.contactLine?.split('\n')[0] || '(555) 123-4567'}
                    onChange={(e) => {
                      const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                      lines[0] = e.target.value;
                      setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                    }}
                    className="text-xs opacity-90 bg-transparent text-white border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                    placeholder="Phone"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">EMAIL</div>
                  <input
                    type="text"
                    value={meta.contactLine?.split('\n')[1] || 'your@email.com'}
                    onChange={(e) => {
                      const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                      lines[1] = e.target.value;
                      setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                    }}
                    className="text-xs opacity-90 bg-transparent text-white border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <div className="text-xs font-bold mb-1">WEBSITE</div>
                  <input
                    type="text"
                    value={meta.contactLine?.split('\n')[4] || 'yourwebsite.com'}
                    onChange={(e) => {
                      const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                      lines[4] = e.target.value;
                      setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                    }}
                    className="text-xs opacity-90 bg-transparent text-white border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-1 py-1 transition-colors"
                    placeholder="Website"
                  />
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
              {/* Header */}
              <div className="mb-6">
                {renderDraggableHeaderElement('name',
                  <input
                    type="text"
                    value={meta.yourName}
                    onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                    className="text-2xl font-bold mb-2 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors uppercase"
                    style={{ 
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                    placeholder="YOUR NAME"
                  />
                )}
                <input
                  type="text"
                  value={meta.contactLine?.split('\n')[3] || 'PROFESSIONAL TITLE'}
                  onChange={(e) => {
                    const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                    lines[3] = e.target.value;
                    setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                  }}
                  className="text-lg text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors uppercase"
                  placeholder="PROFESSIONAL TITLE"
                />
                <div className="h-px bg-gray-200 mt-4"></div>
              </div>

              {/* Date */}
              <div className="mb-6">
                {renderDraggableHeaderElement('date',
                  <input
                    type="text"
                    value={meta.dateLine}
                    onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                    className="text-sm font-bold bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors uppercase"
                    placeholder="DATE"
                  />
                )}
                <div className="h-px bg-gray-200 mt-2"></div>
              </div>

              {/* Structured Content */}
              <div className="mb-6 w-full min-h-96">
                {renderStructuredContent}
              </div>
            </div>
          </div>
        )}

        {/* Minimal Elegant Template */}
        {meta.template === 'minimalElegant' && (
          <div className="p-12">
            {/* Header */}
            <div className="text-center mb-12">
              {renderDraggableHeaderElement('name',
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-4xl font-light mb-4 tracking-wide bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  style={{ 
                    color: meta.accent,
                    maxWidth: '100%',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  placeholder="Your Name"
                />
              )}
              <div className="w-24 h-px mx-auto mb-6" style={{ backgroundColor: meta.accent }}></div>
              <input
                type="text"
                value={meta.contactLine?.split('\n')[3] || 'Professional Title'}
                onChange={(e) => {
                  const lines = meta.contactLine?.split('\n') || ['', '', '', '', ''];
                  lines[3] = e.target.value;
                  setMeta(prev => ({ ...prev, contactLine: lines.join('\n') }));
                }}
                className="text-gray-600 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Professional Title"
              />
            </div>

            {/* Recipient */}
            <div className="mb-8 space-y-2">
              {renderDraggableHeaderElement('date',
                <input
                  type="text"
                  value={meta.dateLine}
                  onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                  className="text-sm text-gray-500 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Date"
                />
              )}
              <input
                type="text"
                value={meta.recipient}
                onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Recipient"
              />
              {renderDraggableHeaderElement('company',
                <div className="space-y-2">
                  <input
                    type="text"
                    value={meta.company}
                    onChange={(e) => setMeta(prev => ({ ...prev, company: e.target.value }))}
                    className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={meta.companyAddress}
                    onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="text-sm text-gray-500 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Company Address (optional)"
                  />
                </div>
              )}
            </div>

            {/* Salutation */}
            <p className="mb-6">Dear {meta.recipient || 'Hiring Manager'},</p>

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="whitespace-pre-wrap mb-8 w-full h-64 bg-transparent border-none outline-none resize-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors leading-relaxed"
              placeholder="Write your cover letter here..."
            />

            {/* Closing */}
            <p className="mb-4">Sincerely,</p>
            <p className="font-bold">{meta.yourName || 'Your Name'}</p>
          </div>
        )}

        {/* Fallback Template - Always shows */}
        {!['modernGradient', 'professionalAccent', 'sidebarProfile', 'minimalElegant'].includes(meta.template) && (
          <div className="p-8">
            {/* Simple Header */}
            <div className="text-center mb-8">
              {renderDraggableHeaderElement('name',
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-3xl font-bold mb-2 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  style={{ 
                    color: meta.accent,
                    maxWidth: '100%',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                  placeholder="Your Name"
                />
              )}
              {renderDraggableHeaderElement('contact',
                <textarea
                  value={meta.contactLine}
                  onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
                  className="text-gray-600 bg-transparent border-none outline-none text-center w-full resize-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  rows={3}
                  placeholder="Contact information..."
                />
              )}
            </div>

            {/* Recipient */}
            <div className="mb-6 space-y-2">
              {renderDraggableHeaderElement('date',
                <input
                  type="text"
                  value={meta.dateLine}
                  onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                  className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Date"
                />
              )}
              <input
                type="text"
                value={meta.recipient}
                onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Recipient"
              />
              {renderDraggableHeaderElement('company',
                <div className="space-y-2">
                  <input
                    type="text"
                    value={meta.company}
                    onChange={(e) => setMeta(prev => ({ ...prev, company: e.target.value }))}
                    className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Company"
                  />
                  <input
                    type="text"
                    value={meta.companyAddress}
                    onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                    className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                    placeholder="Company Address (optional)"
                  />
                </div>
              )}
            </div>

            {/* Divider */}
            {meta.showDivider && <hr className="border-gray-200 mb-6" />}

            {/* Content */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="whitespace-pre-wrap mb-6 w-full h-64 bg-transparent border-none outline-none resize-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              placeholder="Write your cover letter here..."
            />

            {/* Closing */}
            <p className="mb-4">Sincerely,</p>
            <p className="font-bold">{meta.yourName || 'Your Name'}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Minimal Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToStep1}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-200"></div>
              <h1 className="text-lg font-semibold text-gray-900">{initialTitle}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  showSettings 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Customize</span>
              </button>
              
              <button
                onClick={saveCoverLetter}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors font-medium"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              
              <button 
                onClick={() => {
                  const printWindow = window.open('', '_blank');
                  if (printWindow) {
                    const densityStyles = getDensityStyles();
                    const fontFamily = getFontFamily();
                    
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>${initialTitle}</title>
                          <style>
                            @page { 
                              size: A4; 
                              margin: 0; 
                            }
                            body { 
                              font-family: ${fontFamily}; 
                              line-height: ${densityStyles.lineHeight}; 
                              color: #333;
                              margin: 0;
                              padding: 0;
                              background: white;
                            }
                            .cover-letter { 
                              width: 210mm;
                              min-height: 297mm;
                              margin: 0;
                              padding: 0;
                              background: white;
                              box-sizing: border-box;
                            }
                            /* Ensure gradients and colors print properly */
                            * {
                              -webkit-print-color-adjust: exact !important;
                              color-adjust: exact !important;
                              print-color-adjust: exact !important;
                            }
                          </style>
                        </head>
                        <body>
                          <div class="cover-letter">
                            ${renderCoverLetterForPDF()}
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Single continuous page with fixed A4 page break */}
            <div 
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative"
              style={{ 
                fontFamily: getFontFamily(),
                lineHeight: getDensityStyles().lineHeight,
                color: '#333',
                width: '210mm', // A4 width
                minHeight: '297mm' // Minimum A4 height
              }}
            >
              {renderCoverLetter()}
              
              {/* Fixed A4 Page Break - positioned at exactly 297mm from top */}
              {pageBreakData && content.length > pageBreakData.breakPoint && (
                <div 
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{ 
                    top: '297mm', // Fixed A4 page height
                    zIndex: 10
                  }}
                >
                  {/* Background overlay to create clean break */}
                  <div className="absolute inset-0 bg-white/90 backdrop-blur-sm"></div>
                  
                  {/* Page break indicator */}
                  <div className="relative flex items-center py-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                    <div className="mx-6">
                      <div className="bg-white px-4 py-2 text-sm font-medium text-gray-600 border-2 border-gray-300 rounded-lg shadow-lg">
                        A4 Page Break
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Settings Header */}
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Customize Design</h2>
            <p className="text-sm text-gray-600">Make your cover letter unique</p>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-auto">
            {/* Tabs */}
            <div className="px-6 pt-4">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {[
                  { id: "content", label: "Content", icon: Type },
                  { id: "structure", label: "Structure", icon: Layout },
                  { id: "design", label: "Design", icon: Palette },
                  { id: "details", label: "Details", icon: Settings },
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 space-y-6">
              {activeTab === "content" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      value={meta.yourName}
                      onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Information</label>
                    <textarea
                      value={meta.contactLine}
                      onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={3}
                      placeholder="Email, phone, address..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient</label>
                    <input
                      type="text"
                      value={meta.recipient}
                      onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Hiring Manager"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={meta.company}
                      onChange={(e) => setMeta(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="text"
                      value={meta.dateLine}
                      onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Today's date"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Greeting</label>
                    <input
                      type="text"
                      value={meta.greeting || ''}
                      onChange={(e) => setMeta(prev => ({ ...prev, greeting: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Dear Hiring Manager,"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={8}
                      placeholder="Write your cover letter here..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing</label>
                    <input
                      type="text"
                      value={meta.closing || ''}
                      onChange={(e) => setMeta(prev => ({ ...prev, closing: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Sincerely,"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature Name</label>
                    <input
                      type="text"
                      value={meta.signatureName || ''}
                      onChange={(e) => setMeta(prev => ({ ...prev, signatureName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Your Name"
                    />
                  </div>
                </div>
              )}

              {activeTab === "structure" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Content Structure</label>
                    <p className="text-sm text-gray-600 mb-4">Drag to reorder sections or hide empty ones</p>
                    
                    <div className="space-y-2">
                      {getSortedSections().map((section, index) => (
                        <div
                          key={section.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {/* Drag Handle */}
                          <div className="cursor-move text-gray-400 hover:text-gray-600">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          
                          {/* Section Info */}
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{section.label}</div>
                            <div className="text-xs text-gray-500">
                              {section.id === 'greeting' && (meta.greeting ? '✓ Has content' : 'Empty')}
                              {section.id === 'body' && (content.trim() ? '✓ Has content' : 'Empty')}
                              {section.id === 'closing' && (meta.closing ? '✓ Has content' : 'Empty')}
                              {section.id === 'signature' && (meta.signatureName ? '✓ Has content' : 'Empty')}
                            </div>
                          </div>
                          
                          {/* Visibility Toggle */}
                          <button
                            onClick={() => toggleSectionVisibility(section.id)}
                            className={`p-1 rounded transition-colors ${
                              section.visible 
                                ? 'text-emerald-600 hover:text-emerald-700' 
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                            title={section.visible ? 'Hide section' : 'Show section'}
                          >
                            {section.visible ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800">
                        <strong>Tip:</strong> Hide empty sections to create a cleaner look. 
                        Drag sections to change their order in the cover letter.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "design" && (
                <div className="space-y-6">
                  {/* Templates Carousel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Choose Template</label>
                    
                    {/* Category Tabs */}
                    <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                      {Object.keys(
                        TEMPLATE_OPTIONS.reduce((acc, template) => {
                          if (!acc[template.category]) acc[template.category] = [];
                          acc[template.category].push(template);
                          return acc;
                        }, {} as Record<string, typeof TEMPLATE_OPTIONS>)
                      ).map((category) => (
                        <button
                          key={category}
                          className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                            selectedCategory === category
                              ? 'bg-white text-gray-900 shadow-sm'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    {/* Template Carousel */}
                    <div className="relative">
                      <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {TEMPLATE_OPTIONS
                          .filter(template => template.category === selectedCategory)
                          .map((template) => (
                            <button
                              key={template.id}
                              onClick={() => applyTemplate(template.id)}
                              className={`flex-shrink-0 w-32 h-40 rounded-lg border-2 transition-all duration-200 ${
                                meta.template === template.id
                                  ? 'border-emerald-500 shadow-lg scale-105'
                                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                            >
                              {/* Template Preview */}
                              <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 relative">
                                {/* Template Icon */}
                                <div className="absolute top-2 left-2 text-2xl">{template.icon}</div>
                                
                                {/* Template Preview Content */}
                                <div className="absolute inset-0 p-2 flex flex-col justify-between">
                                  <div className="text-center">
                                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-white shadow-sm flex items-center justify-center">
                                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.accent }}></div>
                                    </div>
                                    <div className="text-xs font-medium text-gray-700 mb-1">{template.name}</div>
                                  </div>
                                  
                                  {/* Preview Lines */}
                                  <div className="space-y-1">
                                    <div className="h-1 bg-gray-300 rounded w-full"></div>
                                    <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                                    <div className="h-1 bg-gray-300 rounded w-1/2"></div>
                                  </div>
                                </div>
                                
                                {/* Selected Indicator */}
                                {meta.template === template.id && (
                                  <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                      
                      {/* Scroll Indicators */}
                      <div className="flex justify-center mt-2 space-x-1">
                        {Array.from({ length: Math.ceil(TEMPLATE_OPTIONS.filter(t => t.category === selectedCategory).length / 4) }).map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-gray-300"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Font */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Font</label>
                    <select
                      value={meta.font}
                      onChange={(e) => setMeta(prev => ({ ...prev, font: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {FONT_OPTIONS.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Accent Color */}
                  <ColorWheel 
                    value={meta.accent} 
                    onChange={(color) => setMeta(prev => ({ ...prev, accent: color }))}
                    label="Accent Color"
                  />

                  {/* Gradient Color */}
                  <ColorWheel 
                    value={meta.gradientColor || meta.accent} 
                    onChange={(color) => setMeta(prev => ({ ...prev, gradientColor: color }))}
                    label="Gradient Color"
                  />

                  {/* Density */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spacing</label>
                    <div className="space-y-2">
                      {DENSITY_OPTIONS.map((density) => (
                        <label key={density.id} className="flex items-center">
                          <input
                            type="radio"
                            name="density"
                            value={density.id}
                            checked={meta.density === density.id}
                            onChange={(e) => setMeta(prev => ({ ...prev, density: e.target.value as any }))}
                            className="mr-3 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-sm font-medium">{density.name}</div>
                            <div className="text-xs text-gray-500">{density.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Header Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                    <div className="space-y-2">
                      {HEADER_STYLES.map((style) => (
                        <label key={style.id} className="flex items-center">
                          <input
                            type="radio"
                            name="headerStyle"
                            value={style.id}
                            checked={meta.headerStyle === style.id}
                            onChange={(e) => setMeta(prev => ({ ...prev, headerStyle: e.target.value as any }))}
                            className="mr-3 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-sm font-medium">{style.name}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meta.showDivider}
                        onChange={(e) => setMeta(prev => ({ ...prev, showDivider: e.target.checked }))}
                        className="mr-3 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium">Show divider line</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meta.showRecipientBlock}
                        onChange={(e) => setMeta(prev => ({ ...prev, showRecipientBlock: e.target.checked }))}
                        className="mr-3 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium">Show recipient block</span>
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                    <input
                      type="url"
                      value={meta.logoUrl}
                      onChange={(e) => setMeta(prev => ({ ...prev, logoUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Signature URL</label>
                    <input
                      type="url"
                      value={meta.signatureUrl}
                      onChange={(e) => setMeta(prev => ({ ...prev, signatureUrl: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="https://example.com/signature.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Initials</label>
                    <input
                      type="text"
                      value={meta.yourInitials}
                      onChange={(e) => setMeta(prev => ({ ...prev, yourInitials: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="JR"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                    <textarea
                      value={meta.companyAddress}
                      onChange={(e) => setMeta(prev => ({ ...prev, companyAddress: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={3}
                      placeholder="Company address..."
                    />
                  </div>

                  {/* Footer Style */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Footer Style</label>
                    <div className="space-y-2">
                      {FOOTER_STYLES.map((style) => (
                        <label key={style.id} className="flex items-center">
                          <input
                            type="radio"
                            name="footerStyle"
                            value={style.id}
                            checked={meta.footerStyle === style.id}
                            onChange={(e) => setMeta(prev => ({ ...prev, footerStyle: e.target.value as any }))}
                            className="mr-3 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div>
                            <div className="text-sm font-medium">{style.name}</div>
                            <div className="text-xs text-gray-500">{style.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={meta.showSignature}
                        onChange={(e) => setMeta(prev => ({ ...prev, showSignature: e.target.checked }))}
                        className="mr-3 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium">Show signature</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}