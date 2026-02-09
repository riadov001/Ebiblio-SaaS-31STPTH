import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertReward } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useRewards() {
  return useQuery({
    queryKey: [api.rewards.list.path],
    queryFn: async () => {
      const res = await fetch(api.rewards.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch rewards");
      return api.rewards.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateReward() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertReward) => {
      const res = await fetch(api.rewards.create.path, {
        method: api.rewards.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create reward");
      return api.rewards.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rewards.list.path] });
      toast({
        title: "Reward Created",
        description: "New reward is now available for students.",
      });
    },
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.rewards.redeem.path, { id });
      const res = await fetch(url, {
        method: api.rewards.redeem.method,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to redeem reward");
      }
      return api.rewards.redeem.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Invalidate both rewards list (if quantity tracked) and user points (if we had a user endpoint)
      queryClient.invalidateQueries({ queryKey: [api.rewards.list.path] });
      toast({
        title: "Reward Redeemed!",
        description: "Check your email for redemption details.",
      });
    },
    onError: (error) => {
      toast({
        title: "Redemption Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
