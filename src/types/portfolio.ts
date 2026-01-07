/**
 * Hushh Folio - Portfolio Builder Types
 * TypeScript definitions for the AI-powered portfolio builder
 */

// =====================================================
// Portfolio Types
// =====================================================

export type TemplateId = 'minimal' | 'executive' | 'creative' | 'modern' | 'developer';

export type PortfolioStatus = 'draft' | 'generating' | 'published' | 'archived';

export type SectionType = 
  | 'skills' 
  | 'experience' 
  | 'projects' 
  | 'education' 
  | 'certifications' 
  | 'contact' 
  | 'custom';

export interface Portfolio {
  id: string;
  user_id: string;
  slug: string;
  
  // Basic Info
  name: string;
  email: string;
  dob?: string;
  phone?: string;
  linkedin_url?: string;
  
  // AI Generated Content
  headline?: string;
  bio?: string;
  tagline?: string;
  
  // Template Settings
  template_id: TemplateId;
  theme_color: string;
  
  // Photos
  original_photo_url?: string;
  enhanced_photo_url?: string;
  
  // Social Links
  social_links: SocialLinks;
  
  // Status
  status: PortfolioStatus;
  is_published: boolean;
  published_at?: string;
  firebase_url?: string;
  
  // Analytics
  views_count: number;
  unique_visitors: number;
  
  // Wizard Progress
  wizard_step: number;
  wizard_completed: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  twitter?: string;
  github?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  dribbble?: string;
  behance?: string;
  website?: string;
}

// =====================================================
// Portfolio Section Types
// =====================================================

export interface PortfolioSection {
  id: string;
  portfolio_id: string;
  section_type: SectionType;
  title: string;
  content: SectionContent;
  order_index: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export type SectionContent = 
  | SkillsContent 
  | ExperienceContent 
  | ProjectsContent 
  | EducationContent 
  | CertificationsContent 
  | ContactContent 
  | CustomContent;

export interface SkillsContent {
  skills: Skill[];
}

export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface ExperienceContent {
  experiences: Experience[];
}

export interface Experience {
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  highlights?: string[];
}

export interface ProjectsContent {
  projects: Project[];
}

export interface Project {
  name: string;
  description?: string;
  url?: string;
  image_url?: string;
  technologies?: string[];
  start_date?: string;
  end_date?: string;
}

export interface EducationContent {
  education: Education[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
  highlights?: string[];
}

export interface CertificationsContent {
  certifications: Certification[];
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
  credential_id?: string;
}

export interface ContactContent {
  email?: string;
  phone?: string;
  location?: string;
  availability?: string;
}

export interface CustomContent {
  html?: string;
  markdown?: string;
  items?: { title: string; description: string }[];
}

// =====================================================
// Portfolio Interview Types
// =====================================================

export interface PortfolioInterview {
  id: string;
  portfolio_id: string;
  question_id: number;
  question_text: string;
  answer_text?: string;
  ai_processed: boolean;
  extracted_data?: Record<string, unknown>;
  created_at: string;
}

// Pre-defined interview questions
export const INTERVIEW_QUESTIONS: { id: number; question: string; category: string }[] = [
  { id: 1, question: "What's your current role or profession?", category: 'role' },
  { id: 2, question: "How many years of experience do you have in this field?", category: 'experience' },
  { id: 3, question: "What are your top 3 skills or areas of expertise?", category: 'skills' },
  { id: 4, question: "Which industries have you worked in?", category: 'industries' },
  { id: 5, question: "Tell me about your proudest achievement or biggest win.", category: 'achievements' },
  { id: 6, question: "What are you most passionate about in your work?", category: 'passion' },
  { id: 7, question: "Do you have any notable certifications or degrees?", category: 'education' },
  { id: 8, question: "What kind of opportunities are you looking for?", category: 'goals' },
  { id: 9, question: "What makes you unique in your field?", category: 'unique' },
  { id: 10, question: "Can you share any notable projects or companies you've worked with?", category: 'projects' },
  { id: 11, question: "What's your professional goal for the next 2-3 years?", category: 'future' },
  { id: 12, question: "Any hobbies or interests that showcase your personality?", category: 'hobbies' },
];

// =====================================================
// Template Types
// =====================================================

export interface PortfolioTemplate {
  id: TemplateId;
  name: string;
  description: string;
  preview_image_url: string;
  default_colors: TemplateColors;
  features: string[];
  is_active: boolean;
  is_premium: boolean;
  display_order: number;
}

export interface TemplateColors {
  primary: string;
  secondary?: string;
  accent?: string;
  background: string;
  text?: string;
  surface?: string;
}

// =====================================================
// Analytics Types
// =====================================================

export type AnalyticsEventType = 'view' | 'click' | 'share' | 'download';

export interface PortfolioAnalytics {
  id: string;
  portfolio_id: string;
  event_type: AnalyticsEventType;
  event_data: Record<string, unknown>;
  visitor_id?: string;
  visitor_ip?: string;
  user_agent?: string;
  referrer?: string;
  country?: string;
  city?: string;
  created_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  unique_visitors: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
  top_referrers: { referrer: string; count: number }[];
  views_by_country: { country: string; count: number }[];
  views_over_time: { date: string; count: number }[];
}

// =====================================================
// Wizard State Types
// =====================================================

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const WIZARD_STEPS: { step: WizardStep; title: string; description: string }[] = [
  { step: 1, title: 'Basic Info', description: 'Your name and contact details' },
  { step: 2, title: 'Interview', description: 'Answer questions about your career' },
  { step: 3, title: 'Template', description: 'Choose your portfolio style' },
  { step: 4, title: 'Photo', description: 'Upload and enhance your photo' },
  { step: 5, title: 'Generate', description: 'AI generates your content' },
  { step: 6, title: 'Preview', description: 'Review and edit your portfolio' },
  { step: 7, title: 'Publish', description: 'Set your URL and go live' },
];

export interface WizardState {
  currentStep: WizardStep;
  portfolioId?: string;
  basicInfo: BasicInfoState;
  interviewAnswers: Map<number, string>;
  selectedTemplate: TemplateId;
  photoUrl?: string;
  enhancedPhotoUrl?: string;
  customSlug?: string;
  isGenerating: boolean;
  isPublishing: boolean;
  error?: string;
}

export interface BasicInfoState {
  name: string;
  email: string;
  dob?: string;
  phone?: string;
  linkedinUrl?: string;
}

// =====================================================
// API Request/Response Types
// =====================================================

export interface CreatePortfolioRequest {
  name: string;
  email: string;
  dob?: string;
  phone?: string;
  linkedin_url?: string;
}

export interface CreatePortfolioResponse {
  portfolio: Portfolio;
  slug: string;
}

export interface GenerateContentRequest {
  portfolio_id: string;
  interview_answers: { question_id: number; answer: string }[];
}

export interface GenerateContentResponse {
  headline: string;
  bio: string;
  tagline: string;
  sections: PortfolioSection[];
}

export interface EnhancePhotoRequest {
  portfolio_id: string;
  photo_url: string;
  style?: 'professional' | 'casual' | 'creative';
}

export interface EnhancePhotoResponse {
  enhanced_photo_url: string;
}

export interface PublishPortfolioRequest {
  portfolio_id: string;
  slug?: string; // Optional custom slug
}

export interface PublishPortfolioResponse {
  firebase_url: string;
  slug: string;
  published_at: string;
}

export interface CheckSlugRequest {
  slug: string;
  exclude_portfolio_id?: string;
}

export interface CheckSlugResponse {
  available: boolean;
  suggested_slug?: string;
}

// =====================================================
// Component Props Types
// =====================================================

export interface TemplatePreviewProps {
  template: PortfolioTemplate;
  portfolio?: Partial<Portfolio>;
  isSelected: boolean;
  onSelect: () => void;
}

export interface PortfolioEditorProps {
  portfolio: Portfolio;
  sections: PortfolioSection[];
  onUpdate: (updates: Partial<Portfolio>) => void;
  onSectionUpdate: (sectionId: string, updates: Partial<PortfolioSection>) => void;
  onAddSection: (type: SectionType) => void;
  onRemoveSection: (sectionId: string) => void;
}

export interface PhotoUploaderProps {
  currentPhotoUrl?: string;
  onUpload: (file: File) => Promise<void>;
  onEnhance: () => Promise<void>;
  isEnhancing: boolean;
  enhancedPhotoUrl?: string;
}
