import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DISCIPLINE_LABELS, DISCIPLINES, ROLE_LABELS } from "@shared/schema";
import {
  UserCircle, Mail, Phone, MapPin, BookOpen, Edit, Save, X,
  Award, Calendar, Star, Shield, Zap, Crown, Trophy, Target, Flame
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const BADGE_LEVELS: Record<string, { label: string; icon: any; color: string; minPoints: number }> = {
  newcomer: { label: "Nouveau membre", icon: Star, color: "bg-slate-100 text-slate-600", minPoints: 0 },
  contributor: { label: "Contributeur", icon: Zap, color: "bg-blue-100 text-blue-700", minPoints: 50 },
  active: { label: "Membre actif", icon: Flame, color: "bg-orange-100 text-orange-700", minPoints: 200 },
  expert: { label: "Expert", icon: Trophy, color: "bg-purple-100 text-purple-700", minPoints: 500 },
  champion: { label: "Champion", icon: Crown, color: "bg-amber-100 text-amber-700", minPoints: 1000 },
};

function getBadgeLevel(points: number): string {
  if (points >= 1000) return 'champion';
  if (points >= 500) return 'expert';
  if (points >= 200) return 'active';
  if (points >= 50) return 'contributor';
  return 'newcomer';
}

export default function UserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const userId = (user as any)?.id;

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/users/${userId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!userId,
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PATCH", `/api/users/${userId}/profile`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({ title: "Profil mis à jour", description: "Vos informations ont été enregistrées." });
      setEditing(false);
    },
    onError: (error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });

  const startEditing = () => {
    setFormData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      discipline: profile?.discipline || '',
      bio: profile?.bio || '',
    });
    setEditing(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData);
  };

  const currentPoints = profile?.points || 0;
  const badgeKey = getBadgeLevel(currentPoints);
  const badge = BADGE_LEVELS[badgeKey];
  const BadgeIcon = badge?.icon || Star;

  const nextBadge = Object.entries(BADGE_LEVELS).find(([, v]) => v.minPoints > currentPoints);
  const progressToNext = nextBadge ? Math.min(100, (currentPoints / nextBadge[1].minPoints) * 100) : 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-white rounded-xl" />
            <div className="h-32 bg-white rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="mb-6 md:mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
            <UserCircle className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900" data-testid="text-profile-title">
              Mon Profil
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500">Gérez vos informations personnelles et suivez votre progression.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-6 text-center" data-testid="card-profile-info">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={profile?.profileImageUrl || undefined} alt={profile?.firstName} />
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {profile?.firstName?.[0]}{profile?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-xl font-display font-bold text-slate-900" data-testid="text-user-fullname">
                {profile?.firstName} {profile?.lastName}
              </h2>

              <Badge className="mt-2" data-testid="badge-user-role">
                {ROLE_LABELS[profile?.role] || profile?.role}
              </Badge>

              {profile?.discipline && (
                <p className="text-sm text-slate-500 mt-2">
                  <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                  {DISCIPLINE_LABELS[profile.discipline] || profile.discipline}
                </p>
              )}

              {profile?.createdAt && (
                <p className="text-xs text-slate-400 mt-3 flex items-center justify-center gap-1" data-testid="text-member-since">
                  <Calendar className="w-3 h-3" />
                  Membre depuis {format(new Date(profile.createdAt), "MMMM yyyy", { locale: fr })}
                </p>
              )}
            </Card>

            <Card className="p-5" data-testid="card-badge-level">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Niveau d'engagement</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center ${badge?.color}`}>
                  <BadgeIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900" data-testid="text-badge-label">{badge?.label}</p>
                  <p className="text-xs text-slate-500">{currentPoints} points</p>
                </div>
              </div>

              {nextBadge && (
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{badge?.label}</span>
                    <span>{nextBadge[1].label}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${progressToNext}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">
                    {nextBadge[1].minPoints - currentPoints} points restants
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-2">
                {Object.entries(BADGE_LEVELS).map(([key, val]) => {
                  const Ic = val.icon;
                  const earned = currentPoints >= val.minPoints;
                  return (
                    <div key={key} className={`flex items-center gap-2 text-xs ${earned ? 'text-slate-700' : 'text-slate-300'}`} data-testid={`badge-item-${key}`}>
                      <Ic className={`w-3.5 h-3.5 ${earned ? '' : 'opacity-30'}`} />
                      <span>{val.label}</span>
                      <span className="ml-auto">{val.minPoints} pts</span>
                      {earned && <Shield className="w-3 h-3 text-green-500" />}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-6" data-testid="card-profile-details">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                <h3 className="text-lg font-display font-bold text-slate-900">Informations personnelles</h3>
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={startEditing} data-testid="button-edit-profile">
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending} data-testid="button-save-profile">
                      <Save className="w-3.5 h-3.5 mr-1" />
                      Enregistrer
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setEditing(false)} data-testid="button-cancel-edit">
                      <X className="w-3.5 h-3.5 mr-1" />
                      Annuler
                    </Button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div className="space-y-4">
                  <InfoRow icon={Mail} label="Email" value={profile?.email} testId="text-email" />
                  <InfoRow icon={Phone} label="Téléphone" value={profile?.phone} testId="text-phone" />
                  <InfoRow icon={MapPin} label="Adresse" value={profile?.address} testId="text-address" />
                  <InfoRow icon={BookOpen} label="Discipline" value={profile?.discipline ? (DISCIPLINE_LABELS[profile.discipline] || profile.discipline) : null} testId="text-discipline" />
                  <InfoRow icon={UserCircle} label="Bio" value={profile?.bio} testId="text-bio" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      data-testid="input-firstname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      data-testid="input-lastname"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone (optionnel)</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+243 ..."
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Discipline (optionnel)</label>
                    <Select value={formData.discipline || ''} onValueChange={(val) => setFormData({ ...formData, discipline: val })}>
                      <SelectTrigger data-testid="select-discipline">
                        <SelectValue placeholder="Choisir une discipline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucune</SelectItem>
                        {DISCIPLINES.map(d => (
                          <SelectItem key={d} value={d}>{DISCIPLINE_LABELS[d]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Adresse (optionnel)</label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Kinshasa, RDC"
                      data-testid="input-address"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bio (optionnel)</label>
                    <Textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Quelques mots sur vous..."
                      rows={3}
                      className="resize-none"
                      data-testid="input-bio"
                    />
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-5 mt-4" data-testid="card-stats-summary">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Statistiques</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatMini icon={Award} label="Points" value={currentPoints} color="text-purple-600" bg="bg-purple-50" />
                <StatMini icon={Target} label="Badge" value={badge?.label || '-'} color="text-amber-600" bg="bg-amber-50" />
                <StatMini icon={Calendar} label="Ancienneté" value={profile?.createdAt ? format(new Date(profile.createdAt), "MMM yyyy", { locale: fr }) : '-'} color="text-blue-600" bg="bg-blue-50" />
                <StatMini icon={Shield} label="Rôle" value={ROLE_LABELS[profile?.role] || '-'} color="text-green-600" bg="bg-green-50" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, testId }: { icon: any; label: string; value: string | null | undefined; testId: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm text-slate-700" data-testid={testId}>{value || <span className="text-slate-300 italic">Non renseigné</span>}</p>
      </div>
    </div>
  );
}

function StatMini({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: any; color: string; bg: string }) {
  return (
    <div className="text-center p-3 rounded-lg bg-slate-50">
      <div className={`w-8 h-8 ${bg} rounded-md flex items-center justify-center mx-auto mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
    </div>
  );
}
