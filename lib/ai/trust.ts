import type { LearningTrustDrift } from "@/lib/ai/types";

export function buildTrustDrift(): LearningTrustDrift[] {
  return [
    { subject: "Fire Agent", trust_score: 93, drift: "+5%", driver: "Correctly preferred partial evacuation after corridor signal." },
    { subject: "Medical Agent", trust_score: 91, drift: "+7%", driver: "Protected triage lane reduced congestion in simulations." },
    { subject: "Security Agent", trust_score: 88, drift: "+2%", driver: "Perimeter policy succeeded when exit locks stayed scoped." },
    { subject: "Sensors", trust_score: 84, drift: "-3%", driver: "Noisy smoke sensor produced one false alarm." },
    { subject: "Camera Vision", trust_score: 89, drift: "+4%", driver: "Public corridor validation reduced false evacuation risk." },
    { subject: "Human Operators", trust_score: 94, drift: "+6%", driver: "Overrides improved medical lane timing." },
  ];
}
