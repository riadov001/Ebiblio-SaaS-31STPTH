import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function useAdminUsers() {
  return useQuery({
    queryKey: [api.admin.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Échec du chargement des utilisateurs");
      return res.json();
    },
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Échec du chargement des statistiques");
      return res.json();
    },
  });
}

export function useGlobalStats() {
  return useQuery({
    queryKey: ['/api/admin/global-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/global-stats', { credentials: "include" });
      if (!res.ok) throw new Error("Échec du chargement des statistiques globales");
      return res.json();
    },
  });
}

export function useLibraries() {
  return useQuery({
    queryKey: ['/api/admin/libraries'],
    queryFn: async () => {
      const res = await fetch('/api/admin/libraries', { credentials: "include" });
      if (!res.ok) throw new Error("Échec du chargement des bibliothèques");
      return res.json();
    },
  });
}

export function useCreateLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { name: string; slug: string; universityName: string; description?: string; contactEmail?: string; website?: string; primaryColor?: string; secondaryColor?: string }) => {
      const res = await apiRequest("POST", "/api/admin/libraries", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/libraries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-stats'] });
      toast({ title: "Bibliothèque créée", description: "La nouvelle bibliothèque a été ajoutée." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; name?: string; universityName?: string; description?: string; contactEmail?: string; website?: string; primaryColor?: string; secondaryColor?: string; isActive?: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/libraries/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/libraries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-stats'] });
      toast({ title: "Bibliothèque mise à jour", description: "Les modifications ont été enregistrées." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/libraries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/libraries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-stats'] });
      toast({ title: "Bibliothèque supprimée", description: "La bibliothèque a été retirée du système." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateUserLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, libraryId }: { userId: string; libraryId: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/library`, { libraryId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-stats'] });
      toast({ title: "Affectation mise à jour", description: "L'utilisateur a été transféré à la bibliothèque sélectionnée." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const url = buildUrl(api.admin.users.updateRole.path, { id });
      const res = await fetch(url, {
        method: api.admin.users.updateRole.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec de la mise à jour du rôle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({ title: "Rôle mis à jour", description: "Le rôle de l'utilisateur a été modifié." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateUserPoints() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, points }: { id: string; points: number }) => {
      const url = buildUrl(api.admin.users.updatePoints.path, { id });
      const res = await fetch(url, {
        method: api.admin.users.updatePoints.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec de la mise à jour des points");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      toast({ title: "Points mis à jour", description: "Les points de l'utilisateur ont été modifiés." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const url = buildUrl(api.admin.users.delete.path, { id });
      const res = await fetch(url, {
        method: api.admin.users.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Échec de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({ title: "Utilisateur supprimé", description: "L'utilisateur a été retiré du système." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number; subscriptionTier?: string; premiumSupport?: boolean; extraStorageTb?: number }) => {
      const res = await apiRequest("PATCH", `/api/admin/libraries/${id}/subscription`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/libraries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/global-stats'] });
      toast({ title: "Abonnement mis à jour", description: "Le niveau d'abonnement a été modifié." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useLibraryFeatures(libraryId: number | undefined) {
  return useQuery({
    queryKey: ['/api/library', libraryId, 'features'],
    queryFn: async () => {
      if (!libraryId) return null;
      const res = await fetch(`/api/library/${libraryId}/features`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!libraryId,
  });
}

export function useUpdateLibraryLogo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, logoUrl }: { id: number; logoUrl: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/libraries/${id}/logo`, { logoUrl });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/libraries'] });
      toast({ title: "Logo mis à jour", description: "Le logo de la bibliothèque a été modifié." });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}
