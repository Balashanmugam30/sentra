export type SiteMetric = {
  label: string;
  value: number;
  unit: string;
};

export type ProductPillar = {
  title: string;
  body: string;
};

export type Outcome = {
  label: string;
  proof: string;
};

export type Testimonial = {
  organization: string;
  quote: string;
  persona: string;
};

export type AuthorityBenchmark = {
  benchmark: string;
  sentra: number;
  legacy: number;
};

export type GlobalPresence = {
  city: string;
  country: string;
  sector: string;
  status: string;
  risk_index: number;
};

export type StatusSystem = {
  name: string;
  status: string;
  latency_ms: number;
};

export type InvestorScenario = {
  scenario: string;
  year_3_arr: string;
  assumption: string;
};

export type CareerRole = {
  role: string;
  location: string;
  focus: string;
};

export type StoryChapter = {
  step: number;
  title: string;
  body: string;
};

export type SiteSummary = {
  headline: string;
  subheadline: string;
  positioning: string;
  live_metrics: SiteMetric[];
  trust_strip: string[];
  product_overview: ProductPillar[];
  outcomes: Outcome[];
  social_proof: Testimonial[];
  cta: string[];
};

export type SiteAuthority = {
  market_leadership_score: number;
  category_rank: string;
  innovation_score: number;
  trust_readiness: number;
  product_depth: number;
  roi_proof: number;
  benchmark_wins: AuthorityBenchmark[];
};

export type SiteGlobal = {
  countries_supported: number;
  cities_modeled: number;
  facilities_protected: number;
  population_impact: number;
  active_pilots: number;
  sectors_served: string[];
  presence: GlobalPresence[];
};

export type SiteStatus = {
  uptime: number;
  incidents_resolved: number;
  platform_health: string;
  security_readiness: number;
  compliance_posture: string;
  privacy_commitments: string[];
  systems: StatusSystem[];
};

export type SiteInvestors = {
  market_size: string;
  traction_signals: string[];
  arr_scenarios: InvestorScenario[];
  moat_engine: string[];
  roadmap: string[];
  capital_ask: string;
  board_metrics: Record<string, string>;
};

export type SiteMedia = {
  logos: string[];
  brand_colors: string[];
  founder_bio: string;
  company_story: string;
  fact_sheet: string[];
  press_snippets: string[];
};

export type SiteCareers = {
  mission: string;
  why_join: string[];
  roles: CareerRole[];
  culture: string[];
};

export type SiteStory = {
  chapters: StoryChapter[];
};

export type SiteEnvelope<T> = {
  generated_at: string;
  data: T;
};

export type SiteLeadResponse = {
  ok: boolean;
  message: string;
  generated_at: string;
  data: Record<string, unknown>;
};
