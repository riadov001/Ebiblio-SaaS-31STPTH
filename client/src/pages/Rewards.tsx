import { Sidebar } from "@/components/Sidebar";
import { useRewards, useRedeemReward } from "@/hooks/use-rewards";
import { useAuth } from "@/hooks/use-auth";
import { Award, Gift, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Rewards() {
  const { data: rewards, isLoading } = useRewards();
  const redeemMutation = useRedeemReward();
  const { user } = useAuth();
  
  // Mock points (in a real app, this would be on the user object)
  const userPoints = 450; 

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8 bg-gradient-to-r from-primary to-accent p-8 rounded-3xl text-white shadow-lg shadow-primary/20">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2">Récompenses Étudiants</h1>
              <p className="opacity-90">Échangez vos points durement gagnés contre des avantages exclusifs.</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-75 uppercase tracking-wider font-semibold">Votre Solde</div>
              <div className="text-4xl font-display font-bold flex items-center gap-2 justify-end">
                <Award className="w-8 h-8 text-yellow-300" />
                {user?.points || 0}
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards?.map((reward) => {
              const canAfford = userPoints >= reward.pointsRequired;
              
              return (
                <div key={reward.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col hover:shadow-lg transition-all duration-300 group">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Gift className="w-7 h-7" />
                  </div>
                  
                  <h3 className="font-display font-bold text-xl mb-2">{reward.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 flex-1">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <span className="font-bold text-lg text-primary">{reward.pointsRequired} pts</span>
                    
                    <button
                      onClick={() => redeemMutation.mutate(reward.id)}
                      disabled={!canAfford || redeemMutation.isPending}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                        canAfford 
                          ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-lg" 
                          : "bg-slate-100 text-slate-400 cursor-not-allowed flex items-center gap-2"
                      )}
                    >
                      {!canAfford && <Lock className="w-3 h-3" />}
                      {redeemMutation.isPending ? "Traitement..." : "Échanger"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
