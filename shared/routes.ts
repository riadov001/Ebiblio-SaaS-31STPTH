import { z } from 'zod';
import { insertResourceSchema, insertRewardSchema, resources, rewards, userRewards, users } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  admin: {
    users: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/users' as const,
        responses: {
          200: z.array(z.custom<typeof users.$inferSelect>()),
        },
      },
      updateRole: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:id/role' as const,
        input: z.object({
          role: z.enum(['student', 'professor', 'director', 'super_admin']),
        }),
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
      updatePoints: {
        method: 'PATCH' as const,
        path: '/api/admin/users/:id/points' as const,
        input: z.object({
          points: z.number(),
        }),
        responses: {
          200: z.custom<typeof users.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/users/:id' as const,
        responses: {
          204: z.void(),
          404: errorSchemas.notFound,
        },
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: {
        200: z.object({
          totalUsers: z.number(),
          totalResources: z.number(),
          pendingResources: z.number(),
          approvedResources: z.number(),
          totalRewards: z.number(),
          usersByRole: z.record(z.number()),
        }),
      },
    },
  },
  resources: {
    list: {
      method: 'GET' as const,
      path: '/api/resources' as const,
      input: z.object({
        status: z.string().optional(),
        type: z.string().optional(),
        source: z.string().optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof resources.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/resources/:id' as const,
      responses: {
        200: z.custom<typeof resources.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/resources' as const,
      input: insertResourceSchema,
      responses: {
        201: z.custom<typeof resources.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/resources/:id' as const,
      input: z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof resources.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/resources/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  external: {
    search: {
      method: 'GET' as const,
      path: '/api/external/search' as const,
      input: z.object({
        q: z.string(),
        source: z.enum(['openlibrary', 'doaj', 'all']).default('all'),
      }),
      responses: {
        200: z.array(z.object({
          externalId: z.string(),
          title: z.string(),
          author: z.string().optional(),
          year: z.number().optional(),
          source: z.string(),
          type: z.string(),
          url: z.string().optional(),
          coverUrl: z.string().optional(),
        })),
      },
    },
  },
  rewards: {
    list: {
      method: 'GET' as const,
      path: '/api/rewards' as const,
      responses: {
        200: z.array(z.custom<typeof rewards.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/rewards' as const,
      input: insertRewardSchema,
      responses: {
        201: z.custom<typeof rewards.$inferSelect>(),
      },
    },
    redeem: {
      method: 'POST' as const,
      path: '/api/rewards/:id/redeem' as const,
      responses: {
        200: z.custom<typeof userRewards.$inferSelect>(),
        400: z.object({ message: z.string() }), // Not enough points
      },
    },
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
