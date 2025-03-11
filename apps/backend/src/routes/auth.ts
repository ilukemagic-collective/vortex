import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { registerSchema, loginSchema, oauthLoginSchema } from '../types/auth.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const prisma = new PrismaClient();
const auth = new Hono();

// Register new user
auth.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, username, password, displayName } = c.req.valid('json');

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw new HTTPException(400, { message: 'Email or username already exists' });
  }

  // Create user
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
      displayName: displayName || username,
    },
  });

  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET!),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return c.json({
    tokens: {
      accessToken: session.token,
      refreshToken: session.token, // In a real app, use a separate refresh token
    },
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    },
  });
});

// Login user
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new HTTPException(401, { message: 'Invalid credentials' });
  }

  // Create session
  const session = await prisma.session.create({
    data: {
      userId: user.id,
      token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET!),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return c.json({
    tokens: {
      accessToken: session.token,
      refreshToken: session.token, // In a real app, use a separate refresh token
    },
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatar: user.avatar,
    },
  });
});

// OAuth login
auth.post('/oauth', zValidator('json', oauthLoginSchema), async (c) => {
  const { provider, code, redirectUri } = c.req.valid('json');

  // TODO: Implement OAuth provider-specific logic
  // 1. Exchange code for access token
  // 2. Get user info from provider
  // 3. Create or update user
  // 4. Create session
  throw new HTTPException(501, { message: 'OAuth login not implemented' });
});

export default auth; 