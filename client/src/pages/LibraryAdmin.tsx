import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAdminUsers, useAdminStats, useDeleteUser, useUpdateUserRole, useUpdateUserPoints } from "@/hooks/use-admin";
import { DISCIPLINE_LABELS, DISCIPLINES, ROLE_LABELS, ROLES } from "@shared/schema";
import {
  Settings, Users, Library as LibraryIcon, Plus, Edit, Trash2, Save, X,
  Mail, Phone, MapPin, BookOpen, Award, Calendar, Shield, Search,
  Building2, Globe, Palette, Crown, Star, Zap, Trophy, Flame, UserPlus, ChevronDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BADGE_LEVELS: Record<string, { label: string; icon: any; color: string }> = {
  newcomer: { label: "Nouveau", icon: Star, color: "bg-slate-100 text-slate-600" },
  contributor: { label: "Contributeur", icon: Zap, color: "bg-blue-100 text-blue-700" },
  active: { label: "Actif", icon: Flame, color: "bg-orange-100 text-orange-700" },
  expert: { label: "Expert", icon: Trophy, color: "bg-purple-100 text-purple-700" },
  champion: { label: "Champion", icon: Crown, color: "bg-amber-100 text-amber-700" },
};

function getBadgeLevel(points: number): string {
  if (points >= 1000) return 'champion';
  if (points >= 500) return 'expert';
  if (points >= 200) return 'active';
  if (points >= 50) return 'contributor';
  return 'newcomer';
}

type Tab = 'library' | 'users';

export default function LibraryAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('library');
  const { user } = useAuth();

  const tabs = [
    { id: 'library' as Tab, label: 'Ma Bibliothèque', icon: LibraryIcon },
    { id: 'users' as Tab, label: 'Utilisateurs', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-14 md:pt-8">
        <header className="mb-6 md:mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900" data-testid="text-library-admin-title">
              Gestion de la Bibliothèque
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500">Gérez votre bibliothèque, vos utilisateurs et leurs informations.</p>
        </header>

        <div className="flex gap-2 mb-6 md:mb-8 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar">
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

        {activeTab === 'library' && <LibraryInfoTab />}
        {activeTab === 'users' && <UsersManagementTab />}
      </main>
    </div>
  );
}

function LibraryInfoTab() {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: library, isLoading } = useQuery({
    queryKey: ['/api/library/current'],
    queryFn: async () => {
      const res = await fetch('/api/library/current', { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const [formData, setFormData] = useState<any>({});

  const updateLibrary = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", "/api/admin/my-library", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/library/current'] });
      toast({ title: "Bibliothèque mise à jour", description: "Les informations ont été enregistrées." });
      setEditing(false);
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const startEditing = () => {
    setFormData({
      name: library?.name || '',
      universityName: library?.universityName || '',
      description: library?.description || '',
      contactEmail: library?.contactEmail || '',
      website: library?.website || '',
      primaryColor: library?.primaryColor || '#052c65',
      secondaryColor: library?.secondaryColor || '#C9A84C',
    });
    setEditing(true);
  };

  if (isLoading) {
    return <div className="space-y-4"><div className="h-64 bg-white rounded-xl animate-pulse" /></div>;
  }

  return (
    <div>
      <Card className="p-6 mb-6" data-testid="card-library-info">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex flex-col items-center md:items-start">
            {library?.logoUrl ? (
              <img
                src={library.logoUrl}
                alt={library.name}
                className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-xl border border-slate-200 bg-white p-2"
                data-testid="img-library-logo"
              />
            ) : (
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-xl flex items-center justify-center text-white text-4xl font-bold"
                style={{ backgroundColor: library?.primaryColor || '#052c65' }}
                data-testid="img-library-logo-placeholder"
              >
                {library?.name?.[0] || 'B'}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0 w-full">
            {!editing ? (
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900" data-testid="text-library-name">
                      {library?.name}
                    </h2>
                    <p className="text-sm text-slate-500" data-testid="text-university-name">{library?.universityName}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={startEditing} data-testid="button-edit-library">
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Modifier
                  </Button>
                </div>

                {library?.description && (
                  <p className="text-sm text-slate-600 mb-4">{library.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {library?.contactEmail && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{library.contactEmail}</span>
                    </div>
                  )}
                  {library?.website && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Globe className="w-4 h-4 shrink-0" />
                      <a href={library.website} target="_blank" rel="noopener" className="truncate hover:text-primary">{library.website}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Palette className="w-4 h-4 shrink-0" />
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: library?.primaryColor || '#052c65' }} />
                      <div className="w-5 h-5 rounded-sm border" style={{ backgroundColor: library?.secondaryColor || '#C9A84C' }} />
                      <span className="text-xs">Couleurs de marque</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-display font-bold mb-4">Modifier les informations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-lib-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Université</label>
                    <Input value={formData.universityName} onChange={(e) => setFormData({ ...formData, universityName: e.target.value })} data-testid="input-lib-university" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email de contact</label>
                    <Input value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} data-testid="input-lib-email" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Site web</label>
                    <Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} data-testid="input-lib-website" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Couleur principale</label>
                      <input type="color" value={formData.primaryColor} onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })} className="w-10 h-10 rounded-md border cursor-pointer" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Couleur secondaire</label>
                      <input type="color" value={formData.secondaryColor} onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })} className="w-10 h-10 rounded-md border cursor-pointer" />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="resize-none" data-testid="input-lib-description" />
                  </div>
                </div>
                <div className="flex gap-3 mt-4 flex-wrap">
                  <Button onClick={() => updateLibrary.mutate(formData)} disabled={updateLibrary.isPending} data-testid="button-save-library">
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Enregistrer
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    <X className="w-3.5 h-3.5 mr-1" />
                    Annuler
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function UsersManagementTab() {
  const { data: allUsers, isLoading } = useAdminUsers();
  const deleteUserMutation = useDeleteUser();
  const updateRoleMutation = useUpdateUserRole();
  const updatePointsMutation = useUpdateUserPoints();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [createForm, setCreateForm] = useState({
    email: '', firstName: '', lastName: '', role: 'student',
    phone: '', address: '', discipline: '', bio: '',
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Utilisateur créé", description: "Le compte a été ajouté." });
      setShowCreateForm(false);
      setCreateForm({ email: '', firstName: '', lastName: '', role: 'student', phone: '', address: '', discipline: '', bio: '' });
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}/profile`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Profil mis à jour", description: "Les informations ont été modifiées." });
      setEditingUser(null);
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const users = (allUsers as any[]) || [];
  const filtered = searchQuery
    ? users.filter((u: any) =>
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-slate-900">Utilisateurs ({users.length})</h2>
          <p className="text-sm text-slate-500 mt-1">Créez, modifiez et gérez les comptes.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9 w-48"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-users"
            />
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} data-testid="button-create-user">
            <UserPlus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="p-5 mb-6" data-testid="card-create-user">
          <h3 className="font-display font-bold mb-4">Nouveau utilisateur</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
              <Input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} placeholder="email@example.com" data-testid="input-new-email" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Prénom *</label>
              <Input value={createForm.firstName} onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })} data-testid="input-new-firstname" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nom *</label>
              <Input value={createForm.lastName} onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })} data-testid="input-new-lastname" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rôle</label>
              <Select value={createForm.role} onValueChange={(val) => setCreateForm({ ...createForm, role: val })}>
                <SelectTrigger data-testid="select-new-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.filter(r => r !== 'super_admin').map(r => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
              <Input value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} placeholder="+243 ..." data-testid="input-new-phone" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Discipline</label>
              <Select value={createForm.discipline || 'none'} onValueChange={(val) => setCreateForm({ ...createForm, discipline: val === 'none' ? '' : val })}>
                <SelectTrigger data-testid="select-new-discipline">
                  <SelectValue placeholder="Optionnel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune</SelectItem>
                  {DISCIPLINES.map(d => (
                    <SelectItem key={d} value={d}>{DISCIPLINE_LABELS[d]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
              <Input value={createForm.address} onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })} placeholder="Optionnel" data-testid="input-new-address" />
            </div>
          </div>
          <div className="flex gap-3 mt-4 flex-wrap">
            <Button onClick={() => createUserMutation.mutate(createForm)} disabled={createUserMutation.isPending} data-testid="button-submit-create-user">
              Créer le compte
            </Button>
            <Button variant="outline" onClick={() => setShowCreateForm(false)}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        {filtered.map((u: any) => {
          const badgeKey = getBadgeLevel(u.points || 0);
          const bl = BADGE_LEVELS[badgeKey];
          const BlIcon = bl?.icon || Star;
          const isEditing = editingUser === u.id;

          return (
            <Card key={u.id} className="p-4" data-testid={`card-user-${u.id}`}>
              {!isEditing ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={u.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{u.firstName} {u.lastName}</span>
                      <Badge variant="outline" className="text-xs">{ROLE_LABELS[u.role] || u.role}</Badge>
                      <Badge className={cn("text-xs", bl?.color)}>
                        <BlIcon className="w-3 h-3 mr-0.5" />
                        {bl?.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      {u.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{u.email}</span>}
                      {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.phone}</span>}
                      {u.discipline && <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{DISCIPLINE_LABELS[u.discipline] || u.discipline}</span>}
                      {u.createdAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(u.createdAt), "dd MMM yyyy", { locale: fr })}</span>}
                      <span className="flex items-center gap-1"><Award className="w-3 h-3" />{u.points} pts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => {
                      setEditForm({
                        firstName: u.firstName || '', lastName: u.lastName || '',
                        email: u.email || '', phone: u.phone || '',
                        address: u.address || '', discipline: u.discipline || '',
                        bio: u.bio || '', role: u.role || 'student', points: u.points || 0,
                      });
                      setEditingUser(u.id);
                    }} data-testid={`button-edit-user-${u.id}`}>
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    {u.role !== 'super_admin' && (
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => {
                        if (confirm(`Supprimer ${u.firstName} ${u.lastName} ?`)) {
                          deleteUserMutation.mutate(u.id);
                        }
                      }} data-testid={`button-delete-user-${u.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 mb-3">
                    Modifier {u.firstName} {u.lastName}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Prénom</label>
                      <Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} data-testid={`input-edit-firstname-${u.id}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Nom</label>
                      <Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} data-testid={`input-edit-lastname-${u.id}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                      <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} data-testid={`input-edit-email-${u.id}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                      <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} data-testid={`input-edit-phone-${u.id}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Rôle</label>
                      <Select value={editForm.role} onValueChange={(val) => setEditForm({ ...editForm, role: val })}>
                        <SelectTrigger data-testid={`select-edit-role-${u.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.filter(r => r !== 'super_admin').map(r => (
                            <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Discipline</label>
                      <Select value={editForm.discipline || 'none'} onValueChange={(val) => setEditForm({ ...editForm, discipline: val === 'none' ? '' : val })}>
                        <SelectTrigger data-testid={`select-edit-discipline-${u.id}`}>
                          <SelectValue placeholder="Optionnel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          {DISCIPLINES.map(d => (
                            <SelectItem key={d} value={d}>{DISCIPLINE_LABELS[d]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Points</label>
                      <Input type="number" value={editForm.points} onChange={(e) => setEditForm({ ...editForm, points: parseInt(e.target.value) || 0 })} data-testid={`input-edit-points-${u.id}`} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
                      <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} data-testid={`input-edit-address-${u.id}`} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <Button size="sm" onClick={() => {
                      const { role, points, ...profileData } = editForm;
                      if (role !== u.role) {
                        updateRoleMutation.mutate({ id: u.id, role });
                      }
                      if (points !== u.points) {
                        updatePointsMutation.mutate({ id: u.id, points });
                      }
                      updateProfileMutation.mutate({ id: u.id, ...profileData });
                    }} disabled={updateProfileMutation.isPending} data-testid={`button-save-edit-${u.id}`}>
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Enregistrer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                      <X className="w-3.5 h-3.5 mr-1" />
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          {searchQuery ? "Aucun utilisateur trouvé." : "Aucun utilisateur dans cette bibliothèque."}
        </div>
      )}
    </div>
  );
}
