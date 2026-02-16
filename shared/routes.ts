import { z } from 'zod';
import { insertResourceSchema, insertRewardSchema, insertSuggestionSchema, resources, rewards, userRewards, users, suggestions } from './schema';

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
          totalSuggestions: z.number().optional(),
          pendingSuggestions: z.number().optional(),
          usersByRole: z.record(z.number()),
          resourcesByType: z.record(z.number()).optional(),
          resourcesByDiscipline: z.record(z.number()).optional(),
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
        discipline: z.string().optional(),
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
        type: z.string().optional(),
        discipline: z.string().optional(),
        language: z.string().optional(),
        author: z.string().optional(),
        url: z.string().optional(),
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
        author: z.string().optional(),
        yearFrom: z.coerce.number().optional(),
        yearTo: z.coerce.number().optional(),
        language: z.string().optional(),
        subject: z.string().optional(),
        sort: z.enum(['relevance', 'newest', 'oldest', 'title']).default('relevance'),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(20),
      }),
      responses: {
        200: z.object({
          results: z.array(z.object({
            externalId: z.string(),
            title: z.string(),
            author: z.string().optional(),
            year: z.number().optional(),
            source: z.string(),
            type: z.string(),
            url: z.string().optional(),
            coverUrl: z.string().optional(),
            language: z.string().optional(),
            subject: z.array(z.string()).optional(),
            publisher: z.string().optional(),
            isbn: z.string().optional(),
            journal: z.string().optional(),
            abstract: z.string().optional(),
          })),
          totalResults: z.number(),
          page: z.number(),
          totalPages: z.number(),
        }),
      },
    },
  },
  suggestions: {
    list: {
      method: 'GET' as const,
      path: '/api/suggestions' as const,
      responses: {
        200: z.array(z.custom<typeof suggestions.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/suggestions' as const,
      input: insertSuggestionSchema,
      responses: {
        201: z.custom<typeof suggestions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/suggestions/:id' as const,
      input: z.object({
        status: z.enum(['pending', 'approved', 'rejected']).optional(),
        adminNote: z.string().optional(),
      }),
      responses: {
        200: z.custom<typeof suggestions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    mySuggestions: {
      method: 'GET' as const,
      path: '/api/suggestions/mine' as const,
      responses: {
        200: z.array(z.custom<typeof suggestions.$inferSelect>()),
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
        400: z.object({ message: z.string() }),
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

export type CreateResourceRequest = z.infer<typeof insertResourceSchema>;
export type UpdateResourceRequest = z.infer<typeof api.resources.update.input>;
export type CreateSuggestionRequest = z.infer<typeof insertSuggestionSchema>;
