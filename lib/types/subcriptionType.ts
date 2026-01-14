import { SubscriptionTierEnum, SubscriptionStatusEnum } from "./usersType";

export type { SubscriptionTierEnum, SubscriptionStatusEnum };

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTierEnum;
  price: number;
  features: string[];
  isPopular?: boolean;
}
