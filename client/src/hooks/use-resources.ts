import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { CreateResourceRequest, UpdateResourceRequest } from "@shared/routes";

export function useResources(filters?: { status?: string; type?: string; source?: string; discipline?: string; search?: string }) {
  const queryParams = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, value);
    });
  }

  return useQuery({
    queryKey: [api.resources.list.path, filters],
    queryFn: async () => {
      const url = `${api.resources.list.path}?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Échec du chargement des ressources");
      return res.json();
    },
  });
}

export function useCreateResource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateResourceRequest) => {
      const res = await fetch(api.resources.create.path, {
        method: api.resources.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Échec de la création de la ressource");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
      toast({
        title: "Ressource ajoutée",
        description: "La ressource a été soumise pour approbation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateResource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateResourceRequest) => {
      const url = buildUrl(api.resources.update.path, { id });
      const res = await fetch(url, {
        method: api.resources.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Échec de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
      toast({
        title: "Succès",
        description: "Ressource mise à jour avec succès.",
      });
    },
  });
}

export function useDeleteResource() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.resources.delete.path, { id });
      const res = await fetch(url, {
        method: api.resources.delete.method,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Échec de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
      toast({
        title: "Supprimée",
        description: "Ressource retirée de la bibliothèque.",
      });
    },
  });
}

export interface ExternalSearchFilters {
  q: string;
  source: 'openlibrary' | 'doaj' | 'all';
  author?: string;
  yearFrom?: number;
  yearTo?: number;
  language?: string;
  subject?: string;
  sort?: 'relevance' | 'newest' | 'oldest' | 'title';
  page?: number;
  limit?: number;
}

export function useExternalSearch(filters: ExternalSearchFilters) {
  return useQuery({
    queryKey: [api.external.search.path, filters],
    queryFn: async () => {
      if (!filters.q) return { results: [], totalResults: 0, page: 1, totalPages: 0 };
      const params = new URLSearchParams();
      params.set('q', filters.q);
      params.set('source', filters.source);
      if (filters.author) params.set('author', filters.author);
      if (filters.yearFrom) params.set('yearFrom', String(filters.yearFrom));
      if (filters.yearTo) params.set('yearTo', String(filters.yearTo));
      if (filters.language) params.set('language', filters.language);
      if (filters.subject) params.set('subject', filters.subject);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
      const res = await fetch(`${api.external.search.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Échec de la recherche externe");
      return res.json();
    },
    enabled: !!filters.q && filters.q.length > 2,
    staleTime: 1000 * 60 * 5,
  });
}
