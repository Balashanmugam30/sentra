export type Partner = {
  partner_id: string;
  name: string;
  country: string;
  partner_type: string;
  tier: "silver" | "gold" | "platinum";
  specialization: string;
  certifications: string[];
  revenue_generated: number;
  leads_sent: number;
  win_rate: number;
  commission_due: number;
  health_score: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PartnerReferral = {
  referral_id: string;
  tenant_id: string;
  partner_id: string;
  company_name: string;
  contact_email: string;
  deal_value: number;
  status: string;
  created_at: string;
};

export type PartnersLiveResponse = {
  partner_count: number;
  platinum_partners: number;
  revenue_generated: number;
  commission_due: number;
  referred_pipeline: number;
  avg_partner_health: number;
  top_partners: Partner[];
};

export type PartnerNetworkResponse = {
  partners: Partner[];
};

export type PartnerReferralsResponse = {
  referrals: PartnerReferral[];
};

export type PartnerRevenueResponse = {
  revenue_generated: number;
  commission_due: number;
  partner_revenue_share: number;
  top_countries: Array<{ country: string; revenue: number }>;
  tier_mix: Record<string, number>;
};

export type PartnerCertificationsResponse = {
  certifications: Array<{ name: string; partners: number; tier_weight: number }>;
};

export type PartnerMutationResponse = {
  ok: boolean;
  message: string;
  data: Record<string, unknown>;
};

