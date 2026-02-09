import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAdminUsers, useAdminStats, useUpdateUserRole, useUpdateUserPoints, useDeleteUser } from "@/hooks/use-admin";
import { useResources, useDeleteResource, useUpdateResource } from "@/hooks/use-resources";
import { useRewards, useCreateReward } from "@/hooks/use-rewards";
import { useAuth } from "@/hooks/use-auth";
import { 
  Users, Shield, BookOpen, Award, Trash2, 
  ChevronDown, BarChart3, TrendingUp, 
  CheckCircle, XCircle, Clock, Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type Tab = 'overview' | 'users' | 'resources' | 'rewards';

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { user } = useAuth();
  
  const tabs = [
    { id: 'overview' as Tab, label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'users' as Tab, label: 'Utilisateurs', icon: Users },
    { id: 'resources' as Tab, label: 'Ressources', icon: BookOpen },
    { id: 'rewards' as Tab, label: 'Récompenses', icon: Award },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="mb-6 md:mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight" data-testid="text-admin-title">
              Panneau Super Admin
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500">Contrôle complet de la plateforme E-Biblio.</p>
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
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'resources' && <ResourcesTab />}
        {activeTab === 'rewards' && <RewardsTab />}
      </main>
    </div>
  );
}

function OverviewTab() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  const statCards = [
    { label: "Total Utilisateurs", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Ressources", value: stats?.totalResources || 0, icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "En Attente", value: stats?.pendingResources || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Approuvées", value: stats?.approvedResources || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Récompenses", value: stats?.totalRewards || 0, icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  const roleLabels: Record<string, string> = {
    student: "Étudiant",
    professor: "Professeur",
    director: "Directeur",
    super_admin: "Super Admin",
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <TrendingUp className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {stats?.usersByRole && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-display font-bold text-lg mb-4">Utilisateurs par rôle</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="text-center p-4 rounded-xl bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">{count as number}</p>
                <p className="text-sm text-slate-500">{roleLabels[role] || role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const updateRoleMutation = useUpdateUserRole();
  const updatePointsMutation = useUpdateUserPoints();
  const deleteUserMutation = useDeleteUser();
  const [editingPoints, setEditingPoints] = useState<string | null>(null);
  const [pointsValue, setPointsValue] = useState("");

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>;
  }

  const handlePointsSave = (userId: string) => {
    updatePointsMutation.mutate({ id: userId, points: Number(pointsValue) });
    setEditingPoints(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-users">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Points</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(users as any[])?.map((u: any) => (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-user-${u.id}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {u.firstName?.[0] || u.email?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-slate-400">ID: {u.id.slice(0, 8)}...</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{u.email || 'N/A'}</td>
                <td className="px-6 py-4">
                  <select
                    data-testid={`select-role-${u.id}`}
                    value={u.role}
                    onChange={(e) => updateRoleMutation.mutate({ id: u.id, role: e.target.value })}
                    className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  >
                    <option value="student">Étudiant</option>
                    <option value="professor">Professeur</option>
                    <option value="director">Directeur</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  {editingPoints === u.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(e.target.value)}
                        className="w-24 text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
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
                        Annuler
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
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
                        deleteUserMutation.mutate(u.id);
                      }
                    }}
                    className="text-slate-400 hover:text-destructive transition-colors p-2 rounded-lg hover:bg-destructive/10"
                    data-testid={`button-delete-user-${u.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(!users || (users as any[]).length === 0) && (
        <div className="text-center py-12 text-slate-400">Aucun utilisateur trouvé.</div>
      )}
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
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            data-testid={`button-filter-${status || 'all'}`}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              statusFilter === status ? "bg-primary text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="table-resources">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Titre</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {resources?.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors" data-testid={`row-resource-${r.id}`}>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900 truncate max-w-xs">{r.title}</p>
                      <p className="text-xs text-slate-400">{r.author || 'Auteur inconnu'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 capitalize">
                        {r.type === 'book' ? 'Livre' : r.type === 'article' ? 'Article' : r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{r.source}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        r.status === 'approved' && "bg-green-50 text-green-700",
                        r.status === 'pending' && "bg-amber-50 text-amber-700",
                        r.status === 'rejected' && "bg-red-50 text-red-700",
                      )}>
                        {r.status === 'approved' ? 'Approuvée' : r.status === 'pending' ? 'En attente' : 'Rejetée'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => updateMutation.mutate({ id: r.id, status: 'approved' })}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approuver"
                            data-testid={`button-approve-${r.id}`}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => updateMutation.mutate({ id: r.id, status: 'rejected' })}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Rejeter"
                            data-testid={`button-reject-${r.id}`}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm("Supprimer cette ressource ?")) deleteMutation.mutate(r.id);
                          }}
                          className="p-2 text-slate-400 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          data-testid={`button-delete-resource-${r.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
        </div>
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
      <div className="flex justify-between items-center mb-6 gap-4">
        <h2 className="text-lg font-display font-bold text-slate-900">Gérer les récompenses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-add-reward"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
          <h3 className="font-display font-bold mb-4">Nouvelle récompense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-reward-title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Points requis</label>
              <input
                type="number"
                value={formData.pointsRequired}
                onChange={(e) => setFormData({ ...formData, pointsRequired: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-reward-points"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                rows={3}
                data-testid="input-reward-description"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">URL de l'image (optionnel)</label>
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                data-testid="input-reward-image"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              data-testid="button-save-reward"
              className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards?.map((reward) => (
            <div key={reward.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" data-testid={`card-reward-${reward.id}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-primary">{reward.pointsRequired} pts</span>
              </div>
              <h3 className="font-display font-bold text-lg mb-1">{reward.title}</h3>
              <p className="text-sm text-slate-500">{reward.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
