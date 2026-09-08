export interface GhostwritingProcessStep {
  step: string;
  description: string;
}

export interface GhostwritingPlanFeature {
  title: string;
}

export interface GhostwritingPlan {
  id: string;
  name: string;
  price: number;
  features: GhostwritingPlanFeature[];
  process: GhostwritingProcessStep[];
}
