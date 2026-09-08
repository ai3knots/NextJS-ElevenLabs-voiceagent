export interface MarketingPlanFeature {
  title: string;
  description?: string;
  outcome?: string;
}

export interface MarketingPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  features: MarketingPlanFeature[];
}

export interface EmailTemplate {
  id: string;
  planId: string;
  subject: string;
  htmlContent: string;
}
