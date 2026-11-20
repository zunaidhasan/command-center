export type PipelineStage = 
  | 'new_inquiry' 
  | 'pending_reply' 
  | 'proposal_sent' 
  | 'active_order' 
  | 'in_progress' 
  | 'delivered';

export interface ClientLead {
  id: string;
  clientName: string;
  company?: string;
  platform: 'Fiverr' | 'LinkedIn' | 'Slack' | 'Direct' | 'Referral';
  projectTitle: string;
  stage: PipelineStage;
  value: string;
  notes?: string;
  deadline?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PortfolioReference {
  id: string;
  projectName: string;
  url: string;
  category: string;
  technology: string[];
  features: string[];
  description: string;
  clientType: string;
  status: 'Live' | 'Archived' | 'Demo';
  imagePlaceholderColor?: string;
}
