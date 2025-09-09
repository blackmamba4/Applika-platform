"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [activeTab, setActiveTab] = useState<"content" | "design" | "details">("content");

  // Parse content to extract structured components
  const parseContent = (content: string): { greeting: string; closing: string; signatureName: string } => {
    // Extract greeting (Dear...)
    const greetingMatch = content.match(/Dear\s+([^,\n]+),?\s*/i);
    const greeting = greetingMatch ? greetingMatch[0].trim() : '';
    
    // Extract closing (Warm regards, Best regards, etc.) - more flexible matching
    const closingPatterns = [
      /(Warm regards),?\s*$/im,
      /(Best regards),?\s*$/im,
      /(Sincerely),?\s*$/im,
      /(Kind regards),?\s*$/im,
      /(Yours truly),?\s*$/im,
      /(Thank you),?\s*$/im,
      /(Respectfully),?\s*$/im
    ];
    
    let closing = '';
    for (const pattern of closingPatterns) {
      const match = content.match(pattern);
      if (match) {
        closing = match[1] + ',';
        break;
      }
    }
    
    // Extract signature name (last non-empty line)
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    let signatureName = '';
    
    if (lines.length > 0) {
      const lastLine = lines[lines.length - 1];
      // If last line doesn't contain common closing words, it's likely the signature
      if (!lastLine.match(/^(Warm regards|Best regards|Sincerely|Kind regards|Yours truly|Thank you|Respectfully),?\s*$/i)) {
        signatureName = lastLine;
      }
    }
    
    // Fallback: try to extract from pattern after closing
    if (!signatureName && closing) {
      const signatureMatch = content.match(new RegExp(`${closing.replace(',', '')}\\s*\\n\\s*([A-Za-z\\s]+)\\s*$`, 'im'));
      if (signatureMatch) {
        signatureName = signatureMatch[1].trim();
      }
    }
    
    return { 
      greeting: greeting || `Dear ${content.match(/Dear\s+([^,\n]+)/i)?.[1] || 'Hiring Manager'},`,
      closing: closing || 'Sincerely,',
      signatureName: signatureName || 'Your Name'
    };
  };

  // Auto-parse content when it changes
  useEffect(() => {
    const parsed = parseContent(content);
    if (parsed.greeting || parsed.closing || parsed.signatureName) {
      setMeta(prev => ({
        ...prev,
        greeting: parsed.greeting,
        closing: parsed.closing,
        signatureName: parsed.signatureName
      }));
    }
  }, [content]);
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
        <div style="font-family: ${fontFamily}; line-height: ${densityStyles.lineHeight}; color: #333; width: 210mm; min-height: 297mm; max-height: 297mm; background: white; padding: 0; margin: 0;">
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
      <div style="font-family: ${fontFamily}; line-height: ${densityStyles.lineHeight}; color: #333; width: 210mm; min-height: 297mm; max-height: 297mm; background: white; padding: 24px; margin: 0;">
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
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative"
        style={{ 
          width: '210mm',
          minHeight: '297mm',
          maxHeight: '297mm',
          fontFamily,
          lineHeight: densityStyles.lineHeight,
          color: '#333',
          pageBreakAfter: 'always'
        }}
      >
        {/* Modern Gradient Template */}
        {meta.template === 'modernGradient' && (
          <>
            {/* Gradient Header */}
            <div 
              className="relative h-40 flex flex-col justify-center items-center text-white pt-6"
              style={{
                background: `linear-gradient(135deg, ${meta.accent} 0%, ${meta.gradientColor || '#f97316'} 100%)`
              }}
            >
              <input
                type="text"
                value={meta.yourName}
                onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                className="text-2xl font-bold mb-2 tracking-wide bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-2 py-1 transition-colors"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                placeholder="Your Name"
              />
              <div className="w-16 h-px bg-white/30 mb-4"></div>
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
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Recipient */}
              <div className="mb-6 space-y-2">
                <input
                  type="text"
                  value={meta.dateLine}
                  onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                  className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Date"
                />
                <input
                  type="text"
                  value={meta.recipient}
                  onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                  className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Recipient"
                />
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

              {/* Salutation */}
              <p className="mb-4">{meta.greeting || `Dear ${meta.recipient || 'Hiring Manager'},`}</p>

              {/* Content */}
              <div className="relative">
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => setContent(e.currentTarget.textContent || '')}
                  className="whitespace-pre-wrap mb-6 w-full min-h-96 bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  style={{ 
                    minHeight: '24rem'
                  }}
                  data-placeholder="Write your cover letter here..."
                >
                  {content}
                </div>
                {/* Page break indicator */}
                {content.length > 1000 && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                )}
              </div>

              {/* Closing */}
              <p className="mb-4">{meta.closing || 'Sincerely,'}</p>
              <p className="font-bold">{meta.signatureName || meta.yourName || 'Your Name'}</p>
            </div>
          </>
        )}

        {/* Professional Accent Template */}
        {meta.template === 'professionalAccent' && (
          <>
            {/* Header with Accent Block */}
            <div className="flex">
              <div className="flex-1 p-8">
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-3xl font-bold mb-2 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  style={{ color: meta.accent }}
                  placeholder="Your Name"
                />
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
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 mx-8"></div>

            {/* Content */}
            <div className="p-8">
              {/* Recipient */}
              <div className="mb-6 space-y-2">
                <input
                  type="text"
                  value={meta.dateLine}
                  onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                  className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Date"
                />
                <input
                  type="text"
                  value={meta.recipient}
                  onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                  className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  placeholder="Recipient"
                />
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

              {/* Salutation */}
              <p className="mb-4">{meta.greeting || `Dear ${meta.recipient || 'Hiring Manager'},`}</p>

              {/* Content */}
              <div className="relative">
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => setContent(e.currentTarget.textContent || '')}
                  className="whitespace-pre-wrap mb-6 w-full min-h-96 bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  style={{ 
                    minHeight: '24rem'
                  }}
                  data-placeholder="Write your cover letter here..."
                >
                  {content}
                </div>
                {/* Page break indicator */}
                {content.length > 1000 && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                )}
              </div>

              {/* Closing */}
              <p className="mb-4">{meta.closing || 'Sincerely,'}</p>
              <p className="font-bold">{meta.signatureName || meta.yourName || 'Your Name'}</p>
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
                <input
                  type="text"
                  value={meta.yourName}
                  onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                  className="text-2xl font-bold mb-2 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors uppercase"
                  placeholder="YOUR NAME"
                />
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
                <input
                  type="text"
                  value={meta.dateLine}
                  onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                  className="text-sm font-bold bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors uppercase"
                  placeholder="DATE"
                />
                <div className="h-px bg-gray-200 mt-2"></div>
              </div>

              {/* Salutation */}
              <p className="mb-4">{meta.greeting || `Dear ${meta.recipient || 'Hiring Manager'},`}</p>

              {/* Content */}
              <div className="relative">
                <div
                  contentEditable
                  suppressContentEditableWarning={true}
                  onInput={(e) => setContent(e.currentTarget.textContent || '')}
                  className="whitespace-pre-wrap mb-6 w-full min-h-96 bg-transparent border-none outline-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                  style={{ 
                    minHeight: '24rem'
                  }}
                  data-placeholder="Write your cover letter here..."
                >
                  {content}
                </div>
                {/* Page break indicator */}
                {content.length > 1000 && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                )}
              </div>

              {/* Closing */}
              <p className="mb-4">{meta.closing || 'Sincerely,'}</p>
              <p className="font-bold">{meta.signatureName || meta.yourName || 'Your Name'}</p>
            </div>
          </div>
        )}

        {/* Minimal Elegant Template */}
        {meta.template === 'minimalElegant' && (
          <div className="p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <input
                type="text"
                value={meta.yourName}
                onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                className="text-4xl font-light mb-4 tracking-wide bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                style={{ color: meta.accent }}
                placeholder="Your Name"
              />
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
              <input
                type="text"
                value={meta.dateLine}
                onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                className="text-sm text-gray-500 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Date"
              />
              <input
                type="text"
                value={meta.recipient}
                onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Recipient"
              />
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
              <input
                type="text"
                value={meta.yourName}
                onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                className="text-3xl font-bold mb-2 bg-transparent border-none outline-none text-center w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                style={{ color: meta.accent }}
                placeholder="Your Name"
              />
              <textarea
                value={meta.contactLine}
                onChange={(e) => setMeta(prev => ({ ...prev, contactLine: e.target.value }))}
                className="text-gray-600 bg-transparent border-none outline-none text-center w-full resize-none cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                rows={3}
                placeholder="Contact information..."
              />
            </div>

            {/* Recipient */}
            <div className="mb-6 space-y-2">
              <input
                type="text"
                value={meta.dateLine}
                onChange={(e) => setMeta(prev => ({ ...prev, dateLine: e.target.value }))}
                className="text-sm text-gray-600 bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Date"
              />
              <input
                type="text"
                value={meta.recipient}
                onChange={(e) => setMeta(prev => ({ ...prev, recipient: e.target.value }))}
                className="font-medium bg-transparent border-none outline-none w-full cursor-text hover:bg-gray-50 rounded px-2 py-1 transition-colors"
                placeholder="Recipient"
              />
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
            {renderCoverLetter()}
            {/* Additional page if content is very long */}
            {content.length > 2000 && (
              <div className="mt-8">
                <div className="text-center text-sm text-gray-500 mb-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    Page 2
                  </div>
                </div>
                <div 
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative"
                  style={{ 
                    minHeight: '800px',
                    fontFamily: getFontFamily(),
                    lineHeight: getDensityStyles().lineHeight,
                    color: '#333'
                  }}
                >
                  <div className="p-8">
                    <div className="text-center text-sm text-gray-400 mb-6">
                      Continuation of cover letter...
                    </div>
                    <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-lg font-medium mb-2">Additional Content</div>
                        <div className="text-sm">This space is available for longer cover letters</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                  { id: "design", label: "Design", icon: Palette },
                  { id: "details", label: "Details", icon: Layout },
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cover Letter Content</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      rows={8}
                      placeholder="Write your cover letter here..."
                    />
                  </div>
                </div>
              )}

              {activeTab === "design" && (
                <div className="space-y-6">
                  {/* Templates */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Templates</label>
                    <div className="space-y-4">
                      {Object.entries(
                        TEMPLATE_OPTIONS.reduce((acc, template) => {
                          const category = template.category;
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(template);
                          return acc;
                        }, {} as Record<string, typeof TEMPLATE_OPTIONS>)
                      ).map(([category, templates]) => (
                        <div key={category}>
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                            {category}
                          </h4>
                          <div className="grid grid-cols-2 gap-3">
                            {templates.map((template) => (
                              <button
                                key={template.id}
                                onClick={() => applyTemplate(template.id)}
                                className={`p-3 rounded-lg border text-left transition-colors ${
                                  meta.template === template.id
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-lg mb-1">{template.icon}</div>
                                <div className="text-sm font-medium">{template.name}</div>
                                <div className="text-xs text-gray-500">{template.description}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
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