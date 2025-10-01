// types/coverLetter.ts
export interface CoverLetterMeta {
  font: "inter" | "poppins" | "montserrat" | "georgia" | "playfair" | "system";
  accent: string;
  company: string;
  density: "compact" | "normal" | "roomy";
  logoUrl?: string;
  dateLine: string;
  template: "modernGradient" | "professionalAccent" | "sidebarProfile" | "minimalElegant" | "corporateClassic" | "executiveBold" | "bankingFormal" | "consultingSharp" | "designCreative" | "marketingDynamic" | "startupVibrant" | "techModern" | "healthcareClean" | "educationWarm" | "nonprofitHeart" | "salesEnergetic";
  yourName: string;
  recipient: string;
  contactLine: string;
  footerStyle: "none" | "page" | "initials";
  headerStyle: "nameBlock" | "centered" | "compact";
  showDivider: boolean;
  signatureUrl?: string;
  yourInitials: string;
  showSignature: boolean;
  companyAddress: string;
  recipientName?: string; // "Hiring Manager Name"
  companyName?: string; // "Company Name"
  yourTitle?: string; // "Your Job Title"
  date?: string; // "Date"
  // Parsed content components
  greeting?: string; // "Dear Red Sift Hiring Team,"
  closing?: string; // "Warm regards,"
  signatureName?: string; // "James"
  gradientColor1?: string; // First gradient color
  gradientColor2?: string; // Second gradient color
  showRecipientBlock: boolean;
  showA4PageBreak?: boolean; // Toggle for A4 page break
  sectionSpacing?: number; // Spacing between sections (0-100)
  // Header element visibility controls
  showContactInfo: boolean;
  showRecipientInfo: boolean;
  showCompanyInfo: boolean;
  showDate: boolean;
  // FreeformEditor element state
  elementVisibility?: Record<string, boolean>; // Map of element ID to visibility state
  elementPositions?: Record<string, { x: number; y: number; width: number; height: number }>; // Element positions and sizes
  elementStyles?: Record<string, { fontSize: number; fontWeight: string; color: string; textAlign?: 'left' | 'center' | 'right' }>; // Element styling including alignment
}

export interface CoverLetterEditorProps {
  letterId: string;
  initialTitle: string;
  initialBody: string;
  initialMeta?: CoverLetterMeta;
  onBackToStep1: () => void;
}

export interface ContentSection {
  id: string;
  label: string;
  visible: boolean;
  spacing?: number; // Individual spacing for this section (0-100)
  fontColor?: string; // Individual font color
  isBold?: boolean; // Individual bold styling
  isItalic?: boolean; // Individual italic styling
  isUnderlined?: boolean; // Individual underline styling
  highlightedText?: string; // Text to highlight within this section
  highlightColor?: string; // Color for highlighting
  textAlign?: 'left' | 'center' | 'right'; // Text alignment
  spacingTop?: number; // Top spacing in pixels (0-50)
  spacingBottom?: number; // Bottom spacing in pixels (0-50)
  spacingSides?: number; // Side spacing in pixels (0-50)
}

export interface HeaderElement {
  id: string;
  label: string;
  visible: boolean;
}

// Comprehensive Color System Types
export interface TemplateColorSystem {
  accent: string;           // Primary template color
  gradient1?: string;       // Gradient start
  gradient2?: string;       // Gradient end
  background?: string;      // Background color
}

export interface ElementColorConfig {
  color?: string;           // Custom color override
  inheritFrom?: 'template' | 'accent' | 'gradient' | 'default'; // Fallback source
}

export interface ColorSystem {
  template: TemplateColorSystem;
  elements: Record<string, ElementColorConfig>;
}

export interface ColorInheritance {
  source: 'custom' | 'template' | 'accent' | 'gradient' | 'default';
  value: string;
  canOverride: boolean;
}
