import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { 
  useAdminUsers, useAdminStats, useUpdateUserRole, useUpdateUserPoints, useDeleteUser,
  useGlobalStats, useLibraries, useCreateLibrary, useUpdateLibrary, useDeleteLibrary, useUpdateUserLibrary,
  useUpdateSubscription
} from "@/hooks/use-admin";
import { useResources, useDeleteResource, useUpdateResource } from "@/hooks/use-resources";
import { useRewards, useCreateReward } from "@/hooks/use-rewards";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users, Shield, BookOpen, Award, Trash2, 
  ChevronDown, BarChart3, TrendingUp, 
  CheckCircle, XCircle, Clock, Plus, Lightbulb,
  Library as LibraryIcon, Globe, Download, Edit, Building2, Mail, Link as LinkIcon, Palette,
  CreditCard, HardDrive, Headphones, Star, Crown, Zap
} from "lucide-react";
import { RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS, TIER_LABELS, TIER_PRICES, SUBSCRIPTION_TIERS, ROLE_LABELS } from "@shared/schema";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Tab = 'overview' | 'libraries' | 'users' | 'resources' | 'rewards' | 'subscriptions';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { user } = useAuth();
  
  const tabs = [
    { id: 'overview' as Tab, label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'libraries' as Tab, label: 'Bibliothèques', icon: LibraryIcon },
    { id: 'subscriptions' as Tab, label: 'Abonnements', icon: CreditCard },
    { id: 'users' as Tab, label: 'Utilisateurs', icon: Users },
    { id: 'resources' as Tab, label: 'Ressources', icon: BookOpen },
    { id: 'rewards' as Tab, label: 'Récompenses', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 overflow-x-hidden">
        <header className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-7 h-7 md:w-8 md:h-8 text-primary shrink-0" />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight truncate" data-testid="text-admin-title">
              Panneau Super Admin
            </h1>
          </div>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 truncate">Gestion multi-tenant de la plateforme E-Biblio SaaS.</p>
        </header>

        <div className="flex gap-2 mb-6 md:mb-8 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-testid={`button-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap shrink-0",
                activeTab === tab.id
                  ? "bg-white text-primary border border-slate-200 border-b-white -mb-[1px]"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'libraries' && <LibrariesTab />}
        {activeTab === 'subscriptions' && <SubscriptionsTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'resources' && <ResourcesTab />}
        {activeTab === 'rewards' && <RewardsTab />}
      </main>
    </div>
  );
}

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1'];

function OverviewTab() {
  const { data: globalStats, isLoading: globalLoading } = useGlobalStats();
  const { data: stats, isLoading } = useAdminStats();
  const { toast } = useToast();

  const handleExportAll = async () => {
    try {
      const res = await fetch('/api/admin/export/all', { credentials: 'include' });
      if (!res.ok) throw new Error("Échec de l'export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ebiblio-export-all-${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: "Export réussi", description: "Le fichier de sauvegarde a été téléchargé." });
    } catch (e: any) {
      toast({ title: "Erreur d'export", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading || globalLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const globalCards = [
    { label: "Bibliothèques", value: globalStats?.totalLibraries || 0, icon: LibraryIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Utilisateurs", value: globalStats?.totalUsers || stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Ressources", value: globalStats?.totalResources || stats?.totalResources || 0, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "En Attente", value: stats?.pendingResources || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approuvées", value: stats?.approvedResources || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Fichiers Média", value: globalStats?.totalMedia || 0, icon: Download, color: "text-cyan-600", bg: "bg-cyan-50" },
  ];

  const roleLabels: Record<string, string> = {
    student: "Étudiant",
    professor: "Professeur",
    director: "Directeur",
    super_admin: "Super Admin",
  };

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
      })).filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 10)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
        <h2 className="text-lg font-display font-bold text-slate-900">Statistiques Globales</h2>
        <Button variant="outline" onClick={handleExportAll} data-testid="button-export-all">
          <Download className="w-4 h-4 mr-2" />
          Exporter tout
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {globalCards.map((stat) => (
          <Card key={stat.label} className="p-5" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <p className="text-xl font-display font-bold text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {globalStats?.libraryStats && globalStats.libraryStats.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display font-bold text-base mb-4">Répartition par Bibliothèque</h3>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full" data-testid="table-library-stats">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Bibliothèque</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Université</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Utilisateurs</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Ressources</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {globalStats.libraryStats.map((lib: any) => (
                  <tr key={lib.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-library-stat-${lib.id}`}>
                    <td className="px-4 py-3 font-medium text-slate-900 text-sm">{lib.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{lib.universityName}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right font-medium">{lib.users}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 text-right font-medium">{lib.resources}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/admin/export/library/${lib.id}`, { credentials: 'include' });
                            if (!res.ok) throw new Error("Export échoué");
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `ebiblio-export-${lib.name}-${Date.now()}.json`;
                            a.click();
                            window.URL.revokeObjectURL(url);
                          } catch {}
                        }}
                        data-testid={`button-export-library-${lib.id}`}
                      >
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Export
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-3">
            {globalStats.libraryStats.map((lib: any) => (
              <Card key={lib.id} className="p-4" data-testid={`card-library-stat-${lib.id}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{lib.name}</p>
                    <p className="text-xs text-slate-500 truncate">{lib.universityName}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/admin/export/library/${lib.id}`, { credentials: 'include' });
                        if (!res.ok) throw new Error("Export échoué");
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `ebiblio-export-${lib.name}-${Date.now()}.json`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                      } catch {}
                    }}
                    data-testid={`button-export-library-mobile-${lib.id}`}
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{lib.users}</p>
                    <p className="text-xs text-slate-500">Utilisateurs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-900">{lib.resources}</p>
                    <p className="text-xs text-slate-500">Ressources</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.usersByRole && (
          <Card className="p-6">
            <h3 className="font-display font-bold text-base mb-4">Utilisateurs par rôle</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(stats.usersByRole).map(([role, count]) => (
                <div key={role} className="text-center p-3 rounded-xl bg-slate-50">
                  <p className="text-xl font-bold text-slate-900">{count as number}</p>
                  <p className="text-xs text-slate-500">{roleLabels[role] || role}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {typeChartData.length > 0 && (
          <Card className="p-6">
            <h3 className="font-display font-bold text-base mb-4">Ressources par Type</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                    {typeChartData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {disciplineChartData.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display font-bold text-base mb-4">Ressources par Discipline</h3>
          <div className="h-[280px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%" minWidth={360}>
              <BarChart data={disciplineChartData} layout="vertical" margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={90} axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 4, 4, 0]} barSize={16} name="Ressources" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

function LibrariesTab() {
  const { data: libraries, isLoading } = useLibraries();
  const createMutation = useCreateLibrary();
  const updateMutation = useUpdateLibrary();
  const deleteMutation = useDeleteLibrary();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', universityName: '', description: '', contactEmail: '', website: '', primaryColor: '#052c65', secondaryColor: '#C9A84C'
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({ name: '', slug: '', universityName: '', description: '', contactEmail: '', website: '', primaryColor: '#052c65', secondaryColor: '#C9A84C' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.slug || !formData.universityName) {
      toast({ title: "Champs requis", description: "Le nom, le slug et l'université sont obligatoires.", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData }, { onSuccess: resetForm });
    } else {
      createMutation.mutate(formData, { onSuccess: resetForm });
    }
  };

  const startEdit = (lib: any) => {
    setFormData({
      name: lib.name || '',
      slug: lib.slug || '',
      universityName: lib.universityName || '',
      description: lib.description || '',
      contactEmail: lib.contactEmail || '',
      website: lib.website || '',
      primaryColor: lib.primaryColor || '#052c65',
      secondaryColor: lib.secondaryColor || '#C9A84C',
    });
    setEditingId(lib.id);
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-display font-bold text-slate-900">Gestion des Bibliothèques</h2>
        <Button onClick={() => { resetForm(); setShowForm(true); }} data-testid="button-add-library">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle bibliothèque
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="font-display font-bold mb-4">{editingId ? 'Modifier la bibliothèque' : 'Nouvelle bibliothèque'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la bibliothèque</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bibliothèque Centrale"
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-library-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug (identifiant URL)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="bibliotheque-centrale"
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-library-slug"
                disabled={editingId !== null}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'université</label>
              <input
                type="text"
                value={formData.universityName}
                onChange={(e) => setFormData({ ...formData, universityName: e.target.value })}
                placeholder="Université X"
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-library-university"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email de contact</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@university.ac"
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-library-email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Site web</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.university.ac"
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-library-website"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Couleur principale</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-md border border-slate-200 cursor-pointer"
                    data-testid="input-library-primary-color"
                  />
                  <span className="text-sm text-slate-500">{formData.primaryColor}</span>
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Couleur secondaire</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-10 h-10 rounded-md border border-slate-200 cursor-pointer"
                    data-testid="input-library-secondary-color"
                  />
                  <span className="text-sm text-slate-500">{formData.secondaryColor}</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la bibliothèque..."
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                rows={3}
                data-testid="input-library-description"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save-library">
              {editingId ? 'Enregistrer' : 'Créer la bibliothèque'}
            </Button>
            <Button variant="outline" onClick={resetForm} data-testid="button-cancel-library">
              Annuler
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(libraries as any[])?.map((lib: any) => (
          <Card key={lib.id} className="p-5" data-testid={`card-library-${lib.id}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: lib.primaryColor || '#052c65' }}
                >
                  {lib.name?.[0] || 'B'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-sm text-slate-900 truncate">{lib.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{lib.universityName}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 flex-wrap">
                <Badge className={cn(TIER_COLOR[lib.subscriptionTier || 'free'], 'text-xs')}>
                  {TIER_LABELS[lib.subscriptionTier || 'free']}
                </Badge>
                <Badge variant={lib.isActive ? "default" : "secondary"} className="text-xs">
                  {lib.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>

            {lib.description && (
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{lib.description}</p>
            )}

            <div className="space-y-1.5 mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">/{lib.slug}</span>
              </div>
              {lib.contactEmail && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{lib.contactEmail}</span>
                </div>
              )}
              {lib.website && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <LinkIcon className="w-3 h-3 shrink-0" />
                  <span className="truncate">{lib.website}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: lib.primaryColor || '#052c65' }} title="Principale" />
              <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: lib.secondaryColor || '#C9A84C' }} title="Secondaire" />
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => startEdit(lib)} data-testid={`button-edit-library-${lib.id}`}>
                <Edit className="w-3.5 h-3.5 mr-1" />
                Modifier
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateMutation.mutate({ id: lib.id, isActive: lib.isActive ? 0 : 1 })}
                data-testid={`button-toggle-library-${lib.id}`}
              >
                {lib.isActive ? 'Désactiver' : 'Activer'}
              </Button>
              {lib.id !== 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Supprimer la bibliothèque "${lib.name}" ? Toutes les données associées seront perdues.`)) {
                      deleteMutation.mutate(lib.id);
                    }
                  }}
                  data-testid={`button-delete-library-${lib.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {(!libraries || (libraries as any[]).length === 0) && (
        <div className="text-center py-12 text-slate-400">Aucune bibliothèque trouvée.</div>
      )}
    </div>
  );
}

const TIER_ICON: Record<string, any> = { free: Star, standard: Zap, premium: Crown };
const TIER_COLOR: Record<string, string> = { free: 'bg-slate-100 text-slate-700', standard: 'bg-blue-100 text-blue-700', premium: 'bg-amber-100 text-amber-700' };

const TIER_FEATURES: Record<string, string[]> = {
  free: [
    'Consultation des ressources',
    'Comptes étudiants uniquement',
    '1 To de stockage',
    'Sources académiques',
  ],
  standard: [
    'Tout du plan Gratuit',
    'Comptes professeurs / directeurs',
    'Recherche externe (OpenLibrary, DOAJ)',
    'Approbation de ressources',
    '3 To de stockage',
  ],
  premium: [
    'Tout du plan Standard',
    'Soumission de ressources par étudiants',
    'Système de récompenses complet',
    'Gestion des suggestions',
    '6 To de stockage',
    'Toutes les fonctionnalités',
  ],
};

function SubscriptionsTab() {
  const { data: allLibraries, isLoading } = useLibraries();
  const updateSubscription = useUpdateSubscription();
  const [managingLib, setManagingLib] = useState<number | null>(null);
  const { toast } = useToast();

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-xl animate-pulse" />)}</div>;
  }

  const libs = (allLibraries as any[]) || [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900">Gestion des Abonnements</h2>
          <p className="text-sm text-slate-500 mt-1">Gérez les niveaux d'abonnement de chaque bibliothèque.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const TierIcon = TIER_ICON[tier];
          return (
            <Card key={tier} className={cn("p-5", tier === 'premium' ? 'ring-2 ring-amber-400' : '')} data-testid={`card-tier-${tier}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={cn("w-10 h-10 rounded-md flex items-center justify-center", TIER_COLOR[tier])}>
                  <TierIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900">{TIER_LABELS[tier]}</h3>
                  <p className="text-sm text-slate-500">
                    {TIER_PRICES[tier] === 0 ? 'Gratuit' : `${TIER_PRICES[tier].toFixed(2)} \u20AC/mois`}
                  </p>
                </div>
              </div>
              <ul className="space-y-1.5">
                {TIER_FEATURES[tier].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="mb-4">
        <h3 className="font-display font-bold text-slate-900 mb-1">Options supplémentaires</h3>
        <div className="flex flex-wrap gap-4">
          <Card className="p-4 flex items-center gap-3">
            <Headphones className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Support Premium</p>
              <p className="text-xs text-slate-500">20,00 \u20AC/mois</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Stockage additionnel</p>
              <p className="text-xs text-slate-500">10,00 \u20AC/To par mois</p>
            </div>
          </Card>
        </div>
      </div>

      <h3 className="font-display font-bold text-slate-900 mt-8 mb-4">Bibliothèques &amp; leurs abonnements</h3>

      <div className="space-y-3">
        {libs.map((lib: any) => {
          const tier = lib.subscriptionTier || 'free';
          const TierIcon = TIER_ICON[tier] || Star;
          const isManaging = managingLib === lib.id;

          return (
            <Card key={lib.id} className="p-4" data-testid={`card-subscription-${lib.id}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div 
                    className="w-9 h-9 rounded-md flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{ backgroundColor: lib.primaryColor || '#052c65' }}
                  >
                    {lib.name?.[0] || 'B'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-900 truncate">{lib.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{lib.universityName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn(TIER_COLOR[tier])} data-testid={`badge-tier-${lib.id}`}>
                    <TierIcon className="w-3 h-3 mr-1" />
                    {TIER_LABELS[tier]}
                  </Badge>
                  {lib.premiumSupport === 1 && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      <Headphones className="w-3 h-3 mr-1" />
                      Support Premium
                    </Badge>
                  )}
                  {(lib.extraStorageTb || 0) > 0 && (
                    <Badge variant="outline" className="text-slate-600">
                      <HardDrive className="w-3 h-3 mr-1" />
                      +{lib.extraStorageTb} To
                    </Badge>
                  )}
                  <div className="text-xs text-slate-400 ml-2">
                    Stockage: {lib.storageLimitTb || 1} To
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setManagingLib(isManaging ? null : lib.id)} data-testid={`button-manage-sub-${lib.id}`}>
                    <CreditCard className="w-3.5 h-3.5 mr-1" />
                    {isManaging ? 'Fermer' : 'Gérer'}
                  </Button>
                </div>
              </div>

              {isManaging && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Niveau d'abonnement</label>
                      <select
                        className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        defaultValue={tier}
                        data-testid={`select-tier-${lib.id}`}
                        onChange={(e) => {
                          updateSubscription.mutate({ id: lib.id, subscriptionTier: e.target.value });
                        }}
                      >
                        {SUBSCRIPTION_TIERS.map(t => (
                          <option key={t} value={t}>
                            {TIER_LABELS[t]} {TIER_PRICES[t] > 0 ? `(${TIER_PRICES[t].toFixed(2)} \u20AC/mois)` : '(Gratuit)'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Stockage additionnel (To)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          defaultValue={lib.extraStorageTb || 0}
                          className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          data-testid={`input-extra-storage-${lib.id}`}
                          onBlur={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            if (val !== (lib.extraStorageTb || 0)) {
                              updateSubscription.mutate({ id: lib.id, extraStorageTb: val });
                            }
                          }}
                        />
                        <span className="text-xs text-slate-400 whitespace-nowrap">x 10 \u20AC/mois</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Support Premium</label>
                      <Button
                        variant={lib.premiumSupport === 1 ? "default" : "outline"}
                        size="sm"
                        className="w-full"
                        data-testid={`button-premium-support-${lib.id}`}
                        onClick={() => {
                          updateSubscription.mutate({ id: lib.id, premiumSupport: lib.premiumSupport !== 1 });
                        }}
                      >
                        <Headphones className="w-3.5 h-3.5 mr-1" />
                        {lib.premiumSupport === 1 ? 'Actif (20 \u20AC/mois)' : 'Activer (20 \u20AC/mois)'}
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-md">
                    <p className="text-xs font-medium text-slate-600 mb-1">Coût mensuel estimé :</p>
                    <p className="text-lg font-bold text-slate-900" data-testid={`text-monthly-cost-${lib.id}`}>
                      {(
                        TIER_PRICES[tier] +
                        (lib.premiumSupport === 1 ? 20 : 0) +
                        ((lib.extraStorageTb || 0) * 10)
                      ).toFixed(2)} \u20AC/mois
                    </p>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const { data: libraries } = useLibraries();
  const updateRoleMutation = useUpdateUserRole();
  const updatePointsMutation = useUpdateUserPoints();
  const deleteUserMutation = useDeleteUser();
  const updateLibraryMutation = useUpdateUserLibrary();
  const [editingPoints, setEditingPoints] = useState<string | null>(null);
  const [pointsValue, setPointsValue] = useState("");
  const [filterLibrary, setFilterLibrary] = useState<number | ''>('');

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>;
  }

  const handlePointsSave = (userId: string) => {
    updatePointsMutation.mutate({ id: userId, points: Number(pointsValue) });
    setEditingPoints(null);
  };

  const filteredUsers = filterLibrary 
    ? (users as any[])?.filter((u: any) => u.libraryId === filterLibrary) 
    : (users as any[]);

  const libraryMap: Record<number, string> = {};
  (libraries as any[])?.forEach((lib: any) => { libraryMap[lib.id] = lib.name; });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-display font-bold text-slate-900">Gestion des Utilisateurs</h2>
        {libraries && (libraries as any[]).length > 1 && (
          <select
            value={filterLibrary}
            onChange={(e) => setFilterLibrary(e.target.value ? Number(e.target.value) : '')}
            className="text-sm border border-slate-200 rounded-md px-3 py-2 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            data-testid="select-filter-library"
          >
            <option value="">Toutes les bibliothèques</option>
            {(libraries as any[]).map((lib: any) => (
              <option key={lib.id} value={lib.id}>{lib.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="hidden md:block">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-users">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bibliothèque</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Points</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-user-${u.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {u.firstName?.[0] || u.email?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 text-sm truncate">{u.firstName} {u.lastName}</p>
                          <p className="text-[10px] text-slate-400">ID: {u.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{u.email || 'N/A'}</td>
                    <td className="px-4 py-3">
                      {libraries && (libraries as any[]).length > 1 ? (
                        <select
                          value={u.libraryId || 1}
                          onChange={(e) => updateLibraryMutation.mutate({ userId: u.id, libraryId: Number(e.target.value) })}
                          className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          data-testid={`select-library-${u.id}`}
                        >
                          {(libraries as any[]).map((lib: any) => (
                            <option key={lib.id} value={lib.id}>{lib.name}</option>
                          ))}
                        </select>
                      ) : (
                        <Badge variant="secondary">{libraryMap[u.libraryId] || 'N/A'}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        data-testid={`select-role-${u.id}`}
                        value={u.role}
                        onChange={(e) => updateRoleMutation.mutate({ id: u.id, role: e.target.value })}
                        className="text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        <option value="student">{ROLE_LABELS.student}</option>
                        <option value="professor">{ROLE_LABELS.professor}</option>
                        <option value="director">{ROLE_LABELS.director}</option>
                        <option value="admin">{ROLE_LABELS.admin}</option>
                        <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {editingPoints === u.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={pointsValue}
                            onChange={(e) => setPointsValue(e.target.value)}
                            className="w-20 text-sm border border-slate-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            data-testid={`input-points-${u.id}`}
                          />
                          <button
                            onClick={() => handlePointsSave(u.id)}
                            className="text-xs text-primary font-medium"
                            data-testid={`button-save-points-${u.id}`}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setEditingPoints(null)}
                            className="text-xs text-slate-400"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingPoints(u.id); setPointsValue(String(u.points || 0)); }}
                          className="text-sm font-medium text-slate-900 hover:text-primary transition-colors"
                          data-testid={`button-edit-points-${u.id}`}
                        >
                          {u.points || 0} pts
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Supprimer cet utilisateur ?")) {
                            deleteUserMutation.mutate(u.id);
                          }
                        }}
                        className="text-slate-400 hover:text-destructive"
                        data-testid={`button-delete-user-${u.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!filteredUsers || filteredUsers.length === 0) && (
            <div className="text-center py-12 text-slate-400">Aucun utilisateur trouvé.</div>
          )}
        </Card>
      </div>

      <div className="md:hidden space-y-3">
        {filteredUsers?.map((u: any) => (
          <Card key={u.id} className="p-4" data-testid={`card-user-${u.id}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                  {u.firstName?.[0] || u.email?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 text-sm truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email || 'N/A'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm("Supprimer cet utilisateur ?")) {
                    deleteUserMutation.mutate(u.id);
                  }
                }}
                className="text-slate-400 hover:text-destructive shrink-0"
                data-testid={`button-delete-user-mobile-${u.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {libraries && (libraries as any[]).length > 1 ? (
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Bibliothèque</label>
                  <select
                    value={u.libraryId || 1}
                    onChange={(e) => updateLibraryMutation.mutate({ userId: u.id, libraryId: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    data-testid={`select-library-mobile-${u.id}`}
                  >
                    {(libraries as any[]).map((lib: any) => (
                      <option key={lib.id} value={lib.id}>{lib.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Bibliothèque:</span>
                  <Badge variant="secondary">{libraryMap[u.libraryId] || 'N/A'}</Badge>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Rôle</label>
                  <select
                    data-testid={`select-role-mobile-${u.id}`}
                    value={u.role}
                    onChange={(e) => updateRoleMutation.mutate({ id: u.id, role: e.target.value })}
                    className="w-full text-xs border border-slate-200 rounded-md px-2 py-1.5 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="student">{ROLE_LABELS.student}</option>
                    <option value="professor">{ROLE_LABELS.professor}</option>
                    <option value="director">{ROLE_LABELS.director}</option>
                    <option value="admin">{ROLE_LABELS.admin}</option>
                    <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-500 mb-1">Points</label>
                  {editingPoints === u.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(e.target.value)}
                        className="w-full text-sm border border-slate-200 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        data-testid={`input-points-mobile-${u.id}`}
                      />
                      <button
                        onClick={() => handlePointsSave(u.id)}
                        className="text-xs text-primary font-medium"
                        data-testid={`button-save-points-mobile-${u.id}`}
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingPoints(null)}
                        className="text-xs text-slate-400"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingPoints(u.id); setPointsValue(String(u.points || 0)); }}
                      className="text-sm font-medium text-slate-900 hover:text-primary transition-colors"
                      data-testid={`button-edit-points-mobile-${u.id}`}
                    >
                      {u.points || 0} pts
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {(!filteredUsers || filteredUsers.length === 0) && (
          <div className="text-center py-12 text-slate-400">Aucun utilisateur trouvé.</div>
        )}
      </div>
    </div>
  );
}

function ResourcesTab() {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const { data: resources, isLoading } = useResources(statusFilter ? { status: statusFilter } : undefined);
  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();

  const statusLabels: Record<string, string> = {
    '': 'Toutes',
    'pending': 'En attente',
    'approved': 'Approuvées',
    'rejected': 'Rejetées',
  };

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'pending', 'approved', 'rejected'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(status)}
            data-testid={`button-filter-${status || 'all'}`}
          >
            {statusLabels[status]}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
      ) : (
        <>
        <div className="hidden md:block">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-resources">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Titre</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {resources?.map((r: any) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-resource-${r.id}`}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 truncate max-w-xs text-sm">{r.title}</p>
                        <p className="text-xs text-slate-400">{r.author || 'Auteur inconnu'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{RESOURCE_TYPE_LABELS[r.type] || r.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 capitalize">{r.source}</td>
                      <td className="px-4 py-3">
                        <Badge variant={r.status === 'approved' ? 'default' : r.status === 'pending' ? 'secondary' : 'destructive'}>
                          {r.status === 'approved' ? 'Approuvée' : r.status === 'pending' ? 'En attente' : 'Rejetée'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {r.status !== 'approved' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateMutation.mutate({ id: r.id, status: 'approved' })}
                              className="text-green-600"
                              data-testid={`button-approve-${r.id}`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          {r.status !== 'rejected' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected' })}
                              className="text-red-600"
                              data-testid={`button-reject-${r.id}`}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("Supprimer cette ressource ?")) deleteMutation.mutate(r.id);
                            }}
                            className="text-slate-400 hover:text-destructive"
                            data-testid={`button-delete-resource-${r.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!resources || resources.length === 0) && (
              <div className="text-center py-12 text-slate-400">Aucune ressource trouvée.</div>
            )}
          </Card>
        </div>

        <div className="md:hidden space-y-3">
          {resources?.map((r: any) => (
            <Card key={r.id} className="p-4" data-testid={`card-resource-${r.id}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 text-sm truncate">{r.title}</p>
                  <p className="text-xs text-slate-400">{r.author || 'Auteur inconnu'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge variant="secondary">{RESOURCE_TYPE_LABELS[r.type] || r.type}</Badge>
                <Badge variant={r.status === 'approved' ? 'default' : r.status === 'pending' ? 'secondary' : 'destructive'}>
                  {r.status === 'approved' ? 'Approuvée' : r.status === 'pending' ? 'En attente' : 'Rejetée'}
                </Badge>
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-slate-100">
                {r.status !== 'approved' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateMutation.mutate({ id: r.id, status: 'approved' })}
                    className="text-green-600"
                    data-testid={`button-approve-mobile-${r.id}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}
                {r.status !== 'rejected' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected' })}
                    className="text-red-600"
                    data-testid={`button-reject-mobile-${r.id}`}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Supprimer cette ressource ?")) deleteMutation.mutate(r.id);
                  }}
                  className="text-slate-400 hover:text-destructive"
                  data-testid={`button-delete-resource-mobile-${r.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
          {(!resources || resources.length === 0) && (
            <div className="text-center py-12 text-slate-400">Aucune ressource trouvée.</div>
          )}
        </div>
        </>
      )}
    </div>
  );
}

function RewardsTab() {
  const { data: rewards, isLoading } = useRewards();
  const createMutation = useCreateReward();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', pointsRequired: 100, imageUrl: '' });
  const { toast } = useToast();

  const handleCreate = () => {
    if (!formData.title || !formData.description) {
      toast({ title: "Erreur de validation", description: "Le titre et la description sont requis.", variant: "destructive" });
      return;
    }
    createMutation.mutate(formData, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ title: '', description: '', pointsRequired: 100, imageUrl: '' });
      }
    });
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-lg font-display font-bold text-slate-900">Gérer les récompenses</h2>
        <Button onClick={() => setShowForm(!showForm)} data-testid="button-add-reward">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <h3 className="font-display font-bold mb-4">Nouvelle récompense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-reward-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Points requis</label>
              <input
                type="number"
                value={formData.pointsRequired}
                onChange={(e) => setFormData({ ...formData, pointsRequired: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-reward-points"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-slate-200 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                rows={3}
                data-testid="input-reward-description"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button onClick={handleCreate} disabled={createMutation.isPending} data-testid="button-save-reward">
              Créer la récompense
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(rewards as any[])?.map((r: any) => (
            <Card key={r.id} className="p-5" data-testid={`card-reward-${r.id}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-md bg-purple-50 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-sm text-slate-900 truncate">{r.title}</h3>
                  <p className="text-xs text-purple-600 font-medium">{r.pointsRequired} pts</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{r.description}</p>
            </Card>
          ))}
          {(!rewards || (rewards as any[]).length === 0) && (
            <div className="col-span-full text-center py-12 text-slate-400">Aucune récompense trouvée.</div>
          )}
        </div>
      )}
    </div>
  );
}
