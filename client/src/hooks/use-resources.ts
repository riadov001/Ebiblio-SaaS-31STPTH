import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateResourceRequest, type UpdateResourceRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useResources(filters?: { status?: string; type?: string; source?: string; search?: string }) {
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
      return api.resources.list.responses[200].parse(await res.json());
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
      return api.resources.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.resources.list.path] });
      toast({
        title: "Ressource ajoutée",
        description: "La ressource a été ajoutée avec succès à la bibliothèque.",
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
      return api.resources.update.responses[200].parse(await res.json());
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

export function useExternalSearch(query: string, source: 'openlibrary' | 'doaj' | 'all' = 'all') {
  return useQuery({
    queryKey: [api.external.search.path, query, source],
    queryFn: async () => {
      if (!query) return [];
      const url = `${api.external.search.path}?q=${encodeURIComponent(query)}&source=${source}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Échec de la recherche externe");
      return api.external.search.responses[200].parse(await res.json());
    },
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 5,
  });
}
