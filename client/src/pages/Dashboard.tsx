import { useAuth } from "@/hooks/use-auth";
import { Sidebar } from "@/components/Sidebar";
import { useResources } from "@/hooks/use-resources";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BookOpen, Award, Clock, Users } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: resources, isLoading } = useResources();

  // Mock stats - in production, these would come from an aggregation endpoint
  const stats = [
    { label: "Total Ressources", value: resources?.length || 0, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Étudiants Actifs", value: "1,204", icon: Users, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Attente Approbation", value: resources?.filter(r => r.status === 'pending').length || 0, icon: Clock, color: "text-orange-600", bg: "bg-orange-100" },
    { label: "Récompenses Réclamées", value: "89", icon: Award, color: "text-green-600", bg: "bg-green-100" },
  ];

  const chartData = [
    { name: 'Lun', books: 4 },
    { name: 'Mar', books: 3 },
    { name: 'Mer', books: 10 },
    { name: 'Jeu', books: 7 },
    { name: 'Ven', books: 5 },
    { name: 'Sam', books: 2 },
    { name: 'Dim', books: 1 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Bon retour, {user?.firstName}!
          </h1>
          <p className="text-slate-500 mt-2">Voici ce qui se passe dans votre bibliothèque aujourd'hui.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-3xl font-display font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-display font-bold mb-6">Activité Hebdomadaire</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  />
                  <Bar dataKey="books" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Resources */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-display font-bold mb-6">Ajouts Récents</h2>
            <div className="space-y-4">
              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl" />)}
                </div>
              ) : (
                resources?.slice(0, 5).map((resource) => (
                  <div key={resource.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm truncate">{resource.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{resource.author}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
