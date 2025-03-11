import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(100),
  displayName: z.string().min(1).max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const oauthLoginSchema = z.object({
  provider: z.enum(['GOOGLE', 'GITHUB', 'DISCORD']),
  code: z.string(),
  redirectUri: z.string().url(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthLoginInput = z.infer<typeof oauthLoginSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  tokens: AuthTokens;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    avatar: string | null;
  };
} 