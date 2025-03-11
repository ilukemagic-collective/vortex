import type { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { HTTPException } from 'hono/http-exception';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      id: string;
      email: string;
    };
  }
}

export const auth = async (c: Context, next: () => Promise<void>) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new HTTPException(401, { message: 'Invalid or expired session' });
    }

    // Update session last used time
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsed: new Date() },
    });

    c.set('user', {
      id: session.user.id,
      email: session.user.email,
    });

    await next();
  } catch (error) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }
}; 