import type {
  CertificationsState,
  ChannelPartnersState,
  ChannelPipelineState,
  ChannelResellersState,
  ChannelRevenueState,
  ChannelSummary,
  CountriesState,
  OemState,
  PricingState,
  WhiteLabelState,
} from "@/lib/channel/types";

export const fallbackSummary: ChannelSummary = {
  channel_score: 92,
  partner_arr: 5_880_000,
  white_label_arr: 4_800_000,
  oem_commitment: 7_100_000,
  weighted_pipeline: 5_800_000,
  active_partners: 5,
  reseller_mrr: 526_000,
  countries_ready: 3,
  next_best_country: "UAE",
  launch_readiness_average: 86,
  blocked_countries: [
    { block_id: "BLK-001", country: "Restricted Market A", reason: "Sanctions and export control review", severity: "critical", review_date: "2026-07-01" },
  ],
  strategic_ai: [
    "Launch UAE sovereign pilot before USA motion; pricing fit and procurement readiness are strongest.",
    "Upgrade Singapore GovTech Partner to Diamond after reference architecture is complete.",
    "India channel can scale fastest if implementation academy capacity increases by 20%.",
  ],
  scorecards: [
    { scorecard_id: "SCORE-IN", country: "India", expansion_score: 94, next_best_action: "Scale hospital and campus partner pods", weak_signal: "Partner enablement backlog rising" },
    { scorecard_id: "SCORE-UAE", country: "UAE", expansion_score: 91, next_best_action: "Launch SafeCity Command sovereign pilot", weak_signal: "Legal review must close before national rollout" },
  ],
};

export const fallbackPartners: ChannelPartnersState = {
  partners: [
    { partner_id: "PAR-TATA-SI", tenant_id: "TEN-BALA-UNI", name: "Tata Systems Integrator", type: "regional system integrator", region: "India", countries: ["India", "UAE"], tier: "Platinum", status: "active", support_grade: "A", certification_level: "Sentra Elite", support_sla_hours: 6, pipeline_arr: 4_200_000, partner_arr: 1_380_000, score: 94 },
    { partner_id: "PAR-ACCENTURE-PS", tenant_id: "TEN-GRAND-MERIDIAN", name: "Accenture Public Safety", type: "implementation partner", region: "Global", countries: ["USA", "UK", "Australia"], tier: "Diamond", status: "active", support_grade: "A+", certification_level: "Global Command", support_sla_hours: 4, pipeline_arr: 7_800_000, partner_arr: 2_680_000, score: 97 },
    { partner_id: "PAR-UAE-SMART", tenant_id: "TEN-GOVSECURE", name: "UAE Smart City Group", type: "public sector channel", region: "Middle East", countries: ["UAE", "Saudi Arabia"], tier: "Platinum", status: "active", support_grade: "A", certification_level: "Sovereign Pilot", support_sla_hours: 5, pipeline_arr: 6_400_000, partner_arr: 1_820_000, score: 95 },
  ],
  tiers: [
    { tier_id: "TIER-DIAMOND", name: "Diamond", min_arr: 2_000_000, commission_rate: 16, support_sla_hours: 4, benefits: ["joint enterprise account planning", "priority sandbox", "boardroom co-sell"] },
    { tier_id: "TIER-PLATINUM", name: "Platinum", min_arr: 1_000_000, commission_rate: 18, support_sla_hours: 6, benefits: ["regional exclusivity", "implementation academy", "deal desk support"] },
  ],
  franchise_operators: [
    { operator_id: "FR-MUMBAI", name: "Mumbai Managed Safety Operator", country: "India", city_exclusivity: "Mumbai West", managed_deployments: 46, onboarding_score: 93, arr: 640_000, potential_arr: 1_900_000, status: "active" },
    { operator_id: "FR-DUBAI", name: "Dubai Civil Command Operator", country: "UAE", city_exclusivity: "Dubai hospitality district", managed_deployments: 28, onboarding_score: 91, arr: 880_000, potential_arr: 2_600_000, status: "pilot" },
  ],
  active: 5,
  pipeline_arr: 28_300_000,
  coverage_countries: ["India", "UAE", "Singapore", "USA", "UK", "Australia"],
  coverage_gaps: ["Australia emergency-services integrator", "USA state procurement reseller"],
};

export const fallbackResellers: ChannelResellersState = {
  resellers: [
    { reseller_id: "RES-INDIA-WEST", name: "India West Safety Channel", country: "India", tier: "Platinum", mrr: 186_000, commission_rate: 18, commission_due: 33_480, open_deals: 18, seats_under_management: 7400, status: "active" },
    { reseller_id: "RES-UAE-GOV", name: "UAE Gov Safety Channel", country: "UAE", tier: "Diamond", mrr: 242_000, commission_rate: 16, commission_due: 38_720, open_deals: 11, seats_under_management: 5200, status: "active" },
  ],
  reseller_mrr: 526_000,
  commission_due: 86_900,
  open_deals: 36,
  tiers: { Diamond: 1, Platinum: 1, Gold: 1 },
};

export const fallbackWhitelabel: WhiteLabelState = {
  brands: [
    { brand_id: "BR-SAFECITY", name: "SafeCity Command", client: "SmartCity Authority", region: "Middle East", custom_domain: "command.safecity.demo", theme: "civic blue", language_packs: ["English", "Arabic"], license_seats: 18_000, licensing_arr: 1_420_000, status: "live", domain_status: "verified" },
    { brand_id: "BR-GOVSHIELD", name: "GovShield OS", client: "GovSecure South", region: "APAC Gov", custom_domain: "ops.govshield.demo", theme: "sovereign green", language_packs: ["English", "Hindi"], license_seats: 24_000, licensing_arr: 1_880_000, status: "pilot", domain_status: "pending" },
    { brand_id: "BR-CAMPUSGUARD", name: "CampusGuard Pro", client: "Skyline University", region: "India", custom_domain: "guard.campuspro.demo", theme: "campus amber", language_packs: ["English", "Tamil", "Hindi"], license_seats: 9_200, licensing_arr: 540_000, status: "implementation", domain_status: "verified" },
  ],
  active_brands: 2,
  licensing_arr: 4_800_000,
  license_seats: 64_000,
  language_packs: ["Arabic", "English", "Hindi", "Spanish", "Tamil"],
};

export const fallbackOem: OemState = {
  contracts: [
    { oem_id: "OEM-BMS", name: "Building Management Suite OEM", sector: "smart buildings", partner: "BuildingSoft Global", annual_commitment: 2_100_000, seats: 42_000, api_embedded_usage: 11_800_000, revenue_model: "per-building + API", status: "active", renewal: "2026-12-15" },
    { oem_id: "OEM-AIRPORT", name: "Smart Airport Grid OEM", sector: "airports", partner: "AeroGrid Systems", annual_commitment: 3_400_000, seats: 58_000, api_embedded_usage: 16_400_000, revenue_model: "minimum commit + usage", status: "active", renewal: "2027-01-20" },
  ],
  annual_commitment: 7_100_000,
  seats: 126_000,
  api_embedded_usage: 35_400_000,
  active: 2,
};

export const fallbackCountries: CountriesState = {
  countries: [
    { country_id: "CTY-IN", name: "India", region: "South Asia", readiness_score: 94, legal_complexity: 42, pricing_fit: 91, partner_coverage: 88, procurement_readiness: 86, language_readiness: 92, status: "live", blocked: false, next_action: "Scale university and hospital verticals" },
    { country_id: "CTY-UAE", name: "UAE", region: "Middle East", readiness_score: 91, legal_complexity: 48, pricing_fit: 95, partner_coverage: 82, procurement_readiness: 90, language_readiness: 86, status: "launch_ready", blocked: false, next_action: "Launch sovereign smart-city pilot" },
    { country_id: "CTY-SG", name: "Singapore", region: "APAC", readiness_score: 88, legal_complexity: 36, pricing_fit: 89, partner_coverage: 79, procurement_readiness: 92, language_readiness: 96, status: "launch_ready", blocked: false, next_action: "Close GovTech partner reference" },
  ],
  blocked: fallbackSummary.blocked_countries,
  legal_readiness: [
    { legal_id: "LEGAL-IN", country: "India", privacy_ready: 91, procurement_ready: 86, data_residency: "available", contract_pack: "DPDP + enterprise" },
    { legal_id: "LEGAL-UAE", country: "UAE", privacy_ready: 84, procurement_ready: 90, data_residency: "partner-hosted", contract_pack: "sovereign pilot" },
  ],
  average_readiness: 86,
  next_launch: [],
};
fallbackCountries.next_launch = fallbackCountries.countries.slice(0, 3);

export const fallbackRevenue: ChannelRevenueState = {
  partner_revenue: [
    { revenue_id: "CHREV-001", partner_id: "PAR-TATA-SI", country: "India", arr: 1_380_000, mrr: 115_000, commission_due: 20_700, payout_status: "scheduled", take_rate: 82, forecast_arr: 2_480_000 },
    { revenue_id: "CHREV-002", partner_id: "PAR-UAE-SMART", country: "UAE", arr: 1_820_000, mrr: 151_667, commission_due: 24_267, payout_status: "approved", take_rate: 84, forecast_arr: 4_100_000 },
  ],
  commissions: [
    { commission_id: "COM-001", partner_id: "PAR-TATA-SI", amount: 20_700, status: "due", due_at: "2026-05-01", paid_at: null },
    { commission_id: "COM-002", partner_id: "PAR-UAE-SMART", amount: 24_267, status: "approved", due_at: "2026-05-05", paid_at: null },
  ],
  partner_arr: 5_880_000,
  partner_mrr: 490_000,
  commission_due: 80_700,
  forecast_arr: 12_780_000,
  regional_winners: [],
};
fallbackRevenue.regional_winners = fallbackRevenue.partner_revenue;

export const fallbackPipeline: ChannelPipelineState = {
  pipeline: [
    { pipeline_id: "PIPE-IN-HOSP", region: "India", country: "India", segment: "hospital networks", stage: "proposal", weighted_arr: 1_280_000, probability: 72, next_step: "CISO trust room review", owner: "Tata Systems Integrator" },
    { pipeline_id: "PIPE-UAE-CITY", region: "Middle East", country: "UAE", segment: "smart city command", stage: "security review", weighted_arr: 2_460_000, probability: 68, next_step: "Sovereign data controls", owner: "UAE Smart City Group" },
  ],
  weighted_forecast: 5_800_000,
  stage_mix: { proposal: 1, "security review": 1 },
  high_probability: [],
};
fallbackPipeline.high_probability = fallbackPipeline.pipeline;

export const fallbackCertifications: CertificationsState = {
  certifications: [
    { certification_id: "CERT-TATA-ELITE", partner_id: "PAR-TATA-SI", name: "Sentra Elite Implementer", level: "Elite", trained_staff: 128, score: 94, expires_at: "2027-04-01", status: "active" },
    { certification_id: "CERT-ACC-GLOBAL", partner_id: "PAR-ACCENTURE-PS", name: "Global Command Deployment", level: "Diamond", trained_staff: 260, score: 97, expires_at: "2027-06-15", status: "active" },
  ],
  trained_staff: 464,
  active: 2,
  average_score: 93,
};

export const fallbackPricing: PricingState = {
  pricing: [
    { pricing_id: "PRICE-IN", country: "India", currency: "INR", base_platform_mrr: 6200, per_site_mrr: 980, partner_margin: 18, pricing_fit: 91, status: "approved" },
    { pricing_id: "PRICE-UAE", country: "UAE", currency: "AED", base_platform_mrr: 11200, per_site_mrr: 1800, partner_margin: 16, pricing_fit: 95, status: "approved" },
    { pricing_id: "PRICE-USA", country: "USA", currency: "USD", base_platform_mrr: 14800, per_site_mrr: 2400, partner_margin: 14, pricing_fit: 96, status: "board_review" },
  ],
  legal_readiness: fallbackCountries.legal_readiness,
  average_pricing_fit: 94,
  approved_regions: 2,
};

export function formatMoney(value: number) {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function channelTone(score: number) {
  if (score >= 90) return "text-emerald-200";
  if (score >= 75) return "text-cyan-200";
  if (score >= 60) return "text-amber-200";
  return "text-rose-200";
}

