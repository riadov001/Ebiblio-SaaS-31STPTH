import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { CreateSuggestionRequest } from "@shared/routes";

export function useSuggestions(filters?: { status?: string } | undefined) {
  const enabled = filters !== undefined;
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append("status", filters.status);

  return useQuery({
    queryKey: [api.suggestions.list.path, filters],
    queryFn: async () => {
      const url = `${api.suggestions.list.path}?${queryParams.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Échec du chargement des suggestions");
      return res.json();
    },
    enabled,
  });
}

export function useMySuggestions() {
  return useQuery({
    queryKey: [api.suggestions.mySuggestions.path],
    queryFn: async () => {
      const res = await fetch(api.suggestions.mySuggestions.path, { credentials: "include" });
      if (!res.ok) throw new Error("Échec du chargement des suggestions");
      return res.json();
    },
  });
}

export function useCreateSuggestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateSuggestionRequest) => {
      const res = await fetch(api.suggestions.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Échec de la soumission");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.suggestions.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.suggestions.mySuggestions.path] });
      toast({
        title: "Suggestion envoyée",
        description: "Votre suggestion a été soumise avec succès. +10 points !",
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

export function useUpdateSuggestion() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; status?: string; adminNote?: string }) => {
      const url = buildUrl(api.suggestions.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Échec de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.suggestions.list.path] });
      toast({
        title: "Suggestion mise à jour",
        description: "Le statut de la suggestion a été modifié.",
      });
    },
  });
}
