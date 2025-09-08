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
  template: "modernGradient" | "professionalAccent" | "sidebarProfile" | "minimalElegant";
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
  { id: "modernGradient", name: "Modern Gradient", description: "Stunning gradient header with clean typography", icon: "🌈" },
  { id: "professionalAccent", name: "Professional Accent", description: "Clean design with colored accent block", icon: "💼" },
  { id: "sidebarProfile", name: "Sidebar Profile", description: "Two-column layout with profile picture", icon: "👤" },
  { id: "minimalElegant", name: "Minimal Elegant", description: "Sophisticated minimal design", icon: "✨" },
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
    
    return `
      <div style="font-family: ${fontFamily}; line-height: ${densityStyles.lineHeight}; color: #333;">
        ${meta.headerStyle === 'centered' && `
          <div style="text-align: center; margin-bottom: ${densityStyles.headerSpacing};">
            <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem; color: ${meta.accent};">
              ${meta.yourName}
            </h1>
            ${meta.contactLine && `<p style="margin: 0; font-size: 0.9rem;">${meta.contactLine}</p>`}
          </div>
        `}
        
        ${meta.showRecipientBlock && `
          <div style="margin-bottom: ${densityStyles.paragraphSpacing};">
            <p style="margin: 0;">${meta.dateLine}</p>
            <p style="margin: 0.5rem 0;">${meta.recipient}</p>
            <p style="margin: 0;">${meta.company}</p>
            ${meta.companyAddress && `<p style="margin: 0;">${meta.companyAddress}</p>`}
          </div>
        `}
        
        ${meta.showDivider && `<hr style="border: none; border-top: 1px solid #e5e7eb; margin: ${densityStyles.paragraphSpacing} 0;">`}
        
        <div style="white-space: pre-wrap; margin-bottom: ${densityStyles.paragraphSpacing};">
          ${content}
        </div>
        
        ${meta.showSignature && meta.signatureUrl && `
          <div style="margin-top: 2rem;">
            <img src="${meta.signatureUrl}" alt="Signature" style="max-width: 200px; height: auto;" />
          </div>
        `}
        
        ${meta.footerStyle === 'initials' && meta.yourInitials && `
          <div style="margin-top: 2rem; text-align: right;">
            <p style="margin: 0; font-style: italic;">${meta.yourInitials}</p>
          </div>
        `}
      </div>
    `;
  };

  // BEAUTIFUL TEMPLATES WITH INLINE EDITING
  const renderCoverLetter = () => {
    const densityStyles = getDensityStyles();
    const fontFamily = getFontFamily();
    
    return (
      <div 
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden min-h-[800px] relative"
        style={{ 
          aspectRatio: '8.5/11',
          fontFamily,
          lineHeight: densityStyles.lineHeight,
          color: '#333'
        }}
      >
        {/* Modern Gradient Template */}
        {meta.template === 'modernGradient' && (
          <>
            {/* Gradient Header */}
            <div 
              className="relative h-32 flex flex-col justify-center items-center text-white"
              style={{
                background: `linear-gradient(135deg, ${meta.accent} 0%, #f97316 100%)`
              }}
            >
              <input
                type="text"
                value={meta.yourName}
                onChange={(e) => setMeta(prev => ({ ...prev, yourName: e.target.value }))}
                className="text-2xl font-bold mb-1 tracking-wide bg-transparent text-white text-center border-none outline-none w-full cursor-text hover:bg-white/10 rounded px-2 py-1 transition-colors"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                placeholder="Your Name"
              />
              <div className="w-16 h-px bg-white/30 mb-3"></div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold">PHONE</div>
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
                  <div className="font-semibold">EMAIL</div>
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
                  <div className="font-semibold">ADDRESS</div>
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
              <p className="mb-4">Dear {meta.recipient || 'Hiring Manager'},</p>

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
              <p className="mb-4">Dear {meta.recipient || 'Hiring Manager'},</p>

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
              <p className="mb-4">Dear {meta.recipient || 'Hiring Manager'},</p>

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
            <p className="font-medium">{meta.yourName || 'Your Name'}</p>
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
                            @page { size: A4; margin: 1in; }
                            body { 
                              font-family: ${fontFamily}; 
                              line-height: ${densityStyles.lineHeight}; 
                              color: #333;
                              margin: 0;
                              padding: 0;
                            }
                            .cover-letter { 
                              max-width: 8.5in; 
                              margin: 0 auto; 
                              padding: 1in;
                              background: white;
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
                    <label className="block text-sm font-medium text-gray-700 mb-3">Template</label>
                    <div className="grid grid-cols-2 gap-3">
                      {TEMPLATE_OPTIONS.map((template) => (
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ACCENT_COLORS.map((color) => (
                        <button
                          key={color.id}
                          onClick={() => setMeta(prev => ({ ...prev, accent: color.value }))}
                          className={`p-3 rounded-lg border transition-colors ${
                            meta.accent === color.value
                              ? 'border-emerald-500 ring-2 ring-emerald-200'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div 
                            className="w-full h-4 rounded mb-1"
                            style={{ backgroundColor: color.value }}
                          ></div>
                          <div className="text-xs text-gray-600">{color.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

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