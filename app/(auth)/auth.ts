import type { Session } from 'next-auth'

// Simple auth stub that always returns a valid session (for testing)
export async function auth(): Promise<Session> {
  // Always return a valid session - no API calls, no errors
  return {
    user: {
      id: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
  }
}

// Simple signOut function
export async function signOut(options?: { redirectTo?: string }) {
  'use server'
  
  console.log('User signed out');
  
  // Simple implementation - no API calls
  if (options?.redirectTo) {
    console.log(`Would redirect to: ${options.redirectTo}`);
  }
  
  return { success: true };
}

// Export auth as default too
export default auth
