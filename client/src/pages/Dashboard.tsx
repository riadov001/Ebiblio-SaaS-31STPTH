import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import { useResources } from "@/hooks/use-resources";
import { useAdminStats } from "@/hooks/use-admin";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Award, Clock, Users, TrendingUp, Library } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: resources, isLoading } = useResources();
  const { data: stats } = useAdminStats();

  const userPoints = (user as any)?.points || 0;
  const totalResources = stats?.totalResources || resources?.length || 0;
  const pendingCount = stats?.pendingResources || resources?.filter(r => r.status === 'pending').length || 0;
  const approvedCount = stats?.approvedResources || resources?.filter(r => r.status === 'approved').length || 0;

  const statCards = [
    { label: "Total Ressources", value: totalResources, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Ressources Approuvées", value: approvedCount, icon: TrendingUp, color: "text-green-600", bg: "bg-green-100" },
    { label: "En Attente", value: pendingCount, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Mes Points", value: userPoints, icon: Award, color: "text-purple-600", bg: "bg-purple-100" },
  ];

  const chartData = [
    { name: 'Lun', livres: 4 },
    { name: 'Mar', livres: 3 },
    { name: 'Mer', livres: 10 },
    { name: 'Jeu', livres: 7 },
    { name: 'Ven', livres: 5 },
    { name: 'Sam', livres: 2 },
    { name: 'Dim', livres: 1 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900">
            Bon retour, {user?.firstName} !
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Voici ce qui se passe dans votre bibliothèque aujourd'hui.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm" data-testid={`stat-${stat.label}`}>
              <div className="flex items-center justify-between mb-2 md:mb-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-display font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs md:text-sm text-slate-500 truncate">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <h2 className="text-base md:text-lg font-display font-bold mb-4 md:mb-6">Activité Hebdomadaire</h2>
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="livres" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} name="Livres consultés" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-display font-bold mb-6">Ajouts Récents</h2>
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
                </div>
              ) : resources && resources.length > 0 ? (
                resources.slice(0, 5).map((resource) => (
                  <div key={resource.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors" data-testid={`recent-resource-${resource.id}`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{resource.title}</p>
                      <p className="text-xs text-slate-400">{resource.author || "Auteur inconnu"}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      resource.status === 'approved' ? 'bg-green-50 text-green-700' : 
                      resource.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {resource.status === 'approved' ? 'Approuvée' : resource.status === 'pending' ? 'En attente' : 'Rejetée'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Library className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 mb-3">Aucune ressource encore</p>
                  <Link href="/search">
                    <button className="text-sm text-primary font-medium hover:underline" data-testid="link-search-resources">
                      Rechercher des ressources
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
