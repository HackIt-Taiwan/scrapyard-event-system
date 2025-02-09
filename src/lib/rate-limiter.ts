// Simple in-memory rate limiter for email sending
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const EMAIL_RATE_LIMIT = {
  MAX_EMAILS: 5, // Maximum number of emails per window
  WINDOW_MS: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
};

const rateLimitMap = new Map<string, RateLimitEntry>();

export function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  // If no entry exists or the window has expired, create a new entry
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + EMAIL_RATE_LIMIT.WINDOW_MS,
    });
    return false;
  }

  // If within the window and under the limit, increment the counter
  if (entry.count < EMAIL_RATE_LIMIT.MAX_EMAILS) {
    entry.count++;
    return false;
  }

  // Rate limit exceeded
  return true;
}

// Get remaining emails and time until reset
export function getRateLimitInfo(userId: string): {
  remainingEmails: number;
  msUntilReset: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now > entry.resetTime) {
    return {
      remainingEmails: EMAIL_RATE_LIMIT.MAX_EMAILS,
      msUntilReset: EMAIL_RATE_LIMIT.WINDOW_MS,
    };
  }

  return {
    remainingEmails: Math.max(0, EMAIL_RATE_LIMIT.MAX_EMAILS - entry.count),
    msUntilReset: Math.max(0, entry.resetTime - now),
  };
} 