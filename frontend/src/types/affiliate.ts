export interface AffiliateConfigSummary {
  enabled: boolean;
  referrerRewardType: "PERCENT" | "FIXED";
  referrerRewardValue: number;
  refereeRewardType: "PERCENT" | "FIXED";
  refereeRewardValue: number;
  voucherExpiryDays: number;
  minOrderValue?: number | null;
  maxDiscountValue?: number | null;
  referrerVoucherName: string;
  referrerVoucherContent?: string | null;
  refereeVoucherName: string;
  refereeVoucherContent?: string | null;
}

export interface ReferralRewardInfo {
  rewardRole: "REFERRER" | "REFEREE";
  status: "CREATED" | "FAILED";
  rewardType: "PERCENT" | "FIXED";
  rewardValue: number;
  voucherId?: number | null;
  voucherCode?: string | null;
}

export interface UserReferralItem {
  referralId: number;
  referredUserId: number;
  referredLoginName: string;
  referredEmailMasked?: string | null;
  referralCodeUsed: string;
  status: "SUCCESS" | "REWARDED" | "INVALID" | "CANCELLED";
  createdAt: string;
  rewardedAt?: string | null;
  rewards: ReferralRewardInfo[];
}

export interface UserAffiliateInfo {
  userId: number;
  referralCode: string;
  referralLink: string;
  totalSuccessfulReferrals: number;
  totalRewardsReceived: number;
  affiliateEnabled: boolean;
  currentAffiliateConfigSummary: AffiliateConfigSummary;
}

export interface AffiliateConfig extends AffiliateConfigSummary {
  id: number;
  description?: string | null;
  updatedAt: string;
  updatedBy?: string | null;
}

export interface AffiliateConfigUpdatePayload {
  enabled: boolean;
  referrerRewardType: "PERCENT" | "FIXED";
  referrerRewardValue: number;
  refereeRewardType: "PERCENT" | "FIXED";
  refereeRewardValue: number;
  voucherExpiryDays: number;
  minOrderValue?: number | null;
  maxDiscountValue?: number | null;
  referrerVoucherName: string;
  referrerVoucherContent?: string | null;
  refereeVoucherName: string;
  refereeVoucherContent?: string | null;
  description?: string | null;
}
