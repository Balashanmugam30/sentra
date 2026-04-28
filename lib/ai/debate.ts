import type { AIDecisionIncident, CouncilDebateRound } from "@/lib/ai/types";

export function buildDebateRounds(incident: AIDecisionIncident): CouncilDebateRound[] {
  return [
    {
      round: 1,
      theme: "Immediate posture",
      exchanges: [
        {
          agent: "Fire Agent",
          position: `Begin evacuation and isolate ${incident.zone} before smoke migration accelerates.`,
          challenge: "Medical Agent warns stairwell congestion can create secondary injuries.",
        },
        {
          agent: "Security Agent",
          position: "Perimeter must form before evacuee flow crosses responder ingress.",
          challenge: "Logistics Agent requires east stairwell to remain open for occupants first.",
        },
      ],
    },
    {
      round: 2,
      theme: "Tradeoff negotiation",
      exchanges: [
        {
          agent: "Medical Agent",
          position: "Use phased movement for vulnerable occupants and reserve medics at landing.",
          challenge: "Fire Agent accepts phased lane only if suppression starts immediately.",
        },
        {
          agent: "Communications Agent",
          position: "Issue floor-specific instructions now; hold public statement until scope is verified.",
          challenge: "Executive Risk Agent agrees if audit timeline records every delay rationale.",
        },
      ],
    },
    {
      round: 3,
      theme: "Unified plan merge",
      exchanges: [
        {
          agent: "Logistics Agent",
          position: "Open east stairwell, reserve west corridor for responders, rebalance traffic every 90 seconds.",
          challenge: "All agents accept if Security keeps exits open and Communications avoids panic language.",
        },
        {
          agent: "Executive Risk Agent",
          position: "Life safety dominates; continuity plan starts only after resource dispatch.",
          challenge: "Consensus reached with medical lane protection and containment timing.",
        },
      ],
    },
  ];
}
