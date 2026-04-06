export interface AdminAccount {
  id: number;
  loginName: string;
  email?: string;
  role: string;
  referralCode?: string;
  referredByUserId?: number | null;
  successfulReferralCount?: number;
}
