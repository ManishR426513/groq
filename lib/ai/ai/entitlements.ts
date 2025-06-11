// Simple entitlements system
export interface UserEntitlements {
  canUseModel: (modelId: string) => boolean
  maxRequestsPerDay: number
  maxTokensPerRequest: number
}

export const DEFAULT_ENTITLEMENTS: UserEntitlements = {
  canUseModel: (modelId: string) => true, // Allow all models for now
  maxRequestsPerDay: 1000,
  maxTokensPerRequest: 1024
}

export function getUserEntitlements(userId?: string): UserEntitlements {
  // For now, return default entitlements for all users
  return DEFAULT_ENTITLEMENTS
}

export function canUseModel(modelId: string, userId?: string): boolean {
  const entitlements = getUserEntitlements(userId)
  return entitlements.canUseModel(modelId)
}
