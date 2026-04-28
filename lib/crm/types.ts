export type LeadStatus =
  | "new"
  | "qualified"
  | "contacted"
  | "demo_booked"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost"
  | "nurture";

export type DealStage =
  | "pipeline"
  | "qualified"
  | "demo"
  | "proposal"
  | "legal"
  | "procurement"
  | "closed_won"
  | "closed_lost";

export type ActivityType = "calls" | "emails" | "meetings" | "demo" | "follow_up" | "contract";

export type CrmLead = {
  id: string;
  tenant_id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  role: string;
  industry: string;
  country: string;
  company_size: string;
  source: string;
  score: number;
  status: LeadStatus;
  notes: string;
  created_at: string;
  owner: string;
  deal_value_estimate: number;
};

export type CrmDeal = {
  id: string;
  tenant_id: string;
  lead_id?: string | null;
  company_name: string;
  stage: DealStage;
  value: number;
  probability: number;
  expected_close_date: string;
  owner: string;
  risk: string;
  competitors: string[];
  timeline: string[];
  created_at: string;
  updated_at: string;
};

export type CrmActivity = {
  id: string;
  tenant_id: string;
  lead_id?: string | null;
  deal_id?: string | null;
  activity_type: ActivityType;
  subject: string;
  notes: string;
  owner: string;
  created_at: string;
  next_step?: string | null;
};

export type DemoBooking = {
  id: string;
  tenant_id: string;
  lead_id?: string | null;
  company_name: string;
  contact_name: string;
  scheduled_at: string;
  owner: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  agenda: string;
  meeting_url: string;
};

export type LeadsResponse = {
  leads: CrmLead[];
};

export type DealsResponse = {
  deals: CrmDeal[];
};

export type ActivitiesResponse = {
  activities: CrmActivity[];
};

export type DemosResponse = {
  demos: DemoBooking[];
};

export type CrmForecast = {
  monthly_pipeline: number;
  weighted_pipeline: number;
  likely_closes: CrmDeal[];
  ARR_projection: number;
  MRR_projection: number;
  win_rate: number;
  sales_cycle_days: number;
};

export type LeadScoringResponse = {
  scored_leads: CrmLead[];
  model_factors: Record<string, number>;
  recommendations: string[];
};

export type GrowthMetrics = {
  CAC: number;
  LTV: number;
  LTV_CAC: number;
  Conversion_Rate: number;
  Lead_Velocity: number;
  Pipeline_Velocity: number;
  Churn_Impact: number;
  Expansion_Potential: number;
  ai_recommendations: string[];
};

export type CrmMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

export type LeadCreatePayload = {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  role?: string;
  industry?: string;
  country?: string;
  company_size?: string;
  source?: string;
  status?: LeadStatus;
  notes?: string;
  owner?: string;
  deal_value_estimate?: number;
};

export type DealCreatePayload = {
  lead_id?: string | null;
  company_name: string;
  stage?: DealStage;
  value?: number;
  probability?: number;
  expected_close_date?: string | null;
  owner?: string;
  risk?: string;
  competitors?: string[];
  timeline?: string[];
};

export type ActivityLogPayload = {
  lead_id?: string | null;
  deal_id?: string | null;
  activity_type?: ActivityType;
  subject: string;
  notes?: string;
  owner?: string;
  next_step?: string | null;
};

export type DemoBookPayload = {
  lead_id?: string | null;
  company_name: string;
  contact_name: string;
  scheduled_at?: string | null;
  owner?: string;
  agenda?: string;
};
