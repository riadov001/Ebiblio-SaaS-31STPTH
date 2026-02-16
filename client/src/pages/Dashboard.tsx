import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import { useResources } from "@/hooks/use-resources";
import { useAdminStats } from "@/hooks/use-admin";
import { RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS } from "@shared/schema";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BookOpen, Award, Clock, TrendingUp, Library, Lightbulb, Plus, Search, Globe, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { InteractiveGuide, GuideButton } from "@/components/InteractiveGuide";

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1'];

export default function Dashboard() {
  const [guideOpen, setGuideOpen] = useState(false);
  const { user } = useAuth();
  const { data: resources, isLoading } = useResources();
  const { data: stats } = useAdminStats();

  const userPoints = (user as any)?.points || 0;
  const userRole = (user as any)?.role || 'student';
  const totalResources = stats?.totalResources || resources?.length || 0;
  const pendingCount = stats?.pendingResources || resources?.filter((r: any) => r.status === 'pending').length || 0;
  const approvedCount = stats?.approvedResources || resources?.filter((r: any) => r.status === 'approved').length || 0;

  const statCards = [
    { label: "Total Ressources", value: totalResources, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Approuvées", value: approvedCount, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
    { label: "En Attente", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Mes Points", value: userPoints, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const typeChartData = stats?.resourcesByType 
    ? Object.entries(stats.resourcesByType).map(([key, val]) => ({
        name: RESOURCE_TYPE_LABELS[key] || key,
        value: val as number,
      })).filter(d => d.value > 0)
    : [];

  const disciplineChartData = stats?.resourcesByDiscipline
    ? Object.entries(stats.resourcesByDiscipline).map(([key, val]) => ({
        name: DISCIPLINE_LABELS[key] || key,
        count: val as number,
      })).filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 8)
    : [];

  const quickActions = [
    { label: "Soumettre une ressource", href: "/submit", icon: Plus, desc: "Ajouter une ressource à la bibliothèque" },
    { label: "Faire une suggestion", href: "/suggestions", icon: Lightbulb, desc: "Proposer une ressource (+10 pts)" },
    { label: "Sources académiques", href: "/sources", icon: Globe, desc: "40+ bases de données en libre accès" },
    { label: "Parcourir le catalogue", href: "/resources", icon: Search, desc: "Explorer les ressources approuvées" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900" data-testid="text-dashboard-title">
            Bon retour, {user?.firstName} !
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">Voici ce qui se passe dans votre bibliothèque aujourd'hui.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 md:p-5 border border-slate-100 shadow-sm" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xl md:text-2xl font-display font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 truncate">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {typeChartData.length > 0 && (
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-base font-display font-bold mb-4 text-slate-900">Ressources par Type</h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {typeChartData.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend 
                      iconType="circle" 
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {disciplineChartData.length > 0 && (
            <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-base font-display font-bold mb-4 text-slate-900">Top Disciplines</h2>
              <div className="h-[250px] w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height="100%" minWidth={320}>
                  <BarChart data={disciplineChartData} layout="vertical" margin={{ left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 10 }}
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={18} name="Ressources" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {typeChartData.length === 0 && disciplineChartData.length === 0 && (
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center py-12">
              <Library className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Les statistiques apparaîtront une fois des ressources ajoutées.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-base font-display font-bold mb-4 text-slate-900">Actions Rapides</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4 cursor-pointer hover:shadow-md hover:border-primary/20 transition-all group" data-testid={`action-${action.href.slice(1)}`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                      <p className="text-xs text-slate-400 truncate">{action.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-base font-display font-bold mb-4 text-slate-900">Ajouts Récents</h2>
            <div className="space-y-3">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}
                </div>
              ) : resources && resources.length > 0 ? (
                resources.slice(0, 5).map((resource: any) => (
                  <div key={resource.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors" data-testid={`recent-resource-${resource.id}`}>
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{resource.title}</p>
                      <p className="text-xs text-slate-400 truncate">{resource.author || "Auteur inconnu"}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      resource.status === 'approved' ? 'bg-green-50 text-green-700' : 
                      resource.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {resource.status === 'approved' ? 'OK' : resource.status === 'pending' ? 'Attente' : 'Rejetée'}
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

        <GuideButton onClick={() => setGuideOpen(true)} />
        <InteractiveGuide isOpen={guideOpen} onClose={() => setGuideOpen(false)} />
      </main>
    </div>
  );
}
