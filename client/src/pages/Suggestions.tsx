import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useMySuggestions, useCreateSuggestion, useSuggestions, useUpdateSuggestion } from "@/hooks/use-suggestions";
import { RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS } from "@shared/schema";
import { Lightbulb, Plus, Clock, CheckCircle, XCircle, Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Suggestions() {
  const { user } = useAuth();
  const userRole = (user as any)?.role || 'student';
  const isAdmin = userRole === 'super_admin' || userRole === 'director';
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', url: '', description: '', type: '', discipline: '' });
  const createMutation = useCreateSuggestion();
  const updateMutation = useUpdateSuggestion();

  const { data: mySuggestions, isLoading: myLoading } = useMySuggestions();
  const { data: allSuggestions, isLoading: allLoading } = useSuggestions(isAdmin ? {} : undefined);

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    createMutation.mutate({
      title: formData.title,
      url: formData.url || null,
      description: formData.description || null,
      type: formData.type || null,
      discipline: formData.discipline || null,
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ title: '', url: '', description: '', type: '', discipline: '' });
      }
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'En attente', icon: Clock, color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'approved': return { label: 'Approuvée', icon: CheckCircle, color: 'bg-green-50 text-green-700 border-green-200' };
      case 'rejected': return { label: 'Rejetée', icon: XCircle, color: 'bg-red-50 text-red-700 border-red-200' };
      default: return { label: status, icon: Clock, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-14 md:pt-8">
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight" data-testid="text-suggestions-title">
                Suggestions de Ressources
              </h1>
              <p className="text-sm md:text-base text-slate-500 mt-1">
                Proposez de nouvelles ressources Open Access à intégrer dans la bibliothèque. Gagnez 10 points par suggestion !
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/25 hover:shadow-lg transition-all self-center md:self-auto"
              data-testid="button-new-suggestion"
            >
              <Plus className="w-4 h-4" />
              Nouvelle suggestion
            </button>
          </div>
        </header>

        {showForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8" data-testid="form-suggestion">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-secondary" />
              Proposer une ressource
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Titre de la ressource *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Revue Africaine de Droit International"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  data-testid="input-suggestion-title"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">URL (lien vers la ressource)</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  data-testid="input-suggestion-url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de ressource</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                  data-testid="select-suggestion-type"
                >
                  <option value="">-- Sélectionner --</option>
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discipline</label>
                <select
                  value={formData.discipline}
                  onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                  data-testid="select-suggestion-discipline"
                >
                  <option value="">-- Sélectionner --</option>
                  {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Commentaire</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Pourquoi cette ressource serait utile pour la bibliothèque ?"
                  rows={3}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  data-testid="input-suggestion-description"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={createMutation.isPending || !formData.title.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                data-testid="button-submit-suggestion"
              >
                <Send className="w-4 h-4" />
                {createMutation.isPending ? "Envoi..." : "Envoyer"}
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

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-display font-bold mb-4 text-slate-900">Mes suggestions</h2>
            {myLoading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
              </div>
            ) : !mySuggestions || mySuggestions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <Lightbulb className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Vous n'avez pas encore soumis de suggestion.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {mySuggestions.map((s: any) => {
                  const status = getStatusInfo(s.status);
                  return (
                    <div key={s.id} className="bg-white rounded-xl border border-slate-100 p-4 md:p-5" data-testid={`suggestion-${s.id}`}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{s.title}</h3>
                          {s.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{s.description}</p>}
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">{s.url}</a>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", status.color)}>
                            {status.label}
                          </span>
                          <span className="text-xs text-slate-400">
                            {s.createdAt && format(new Date(s.createdAt), 'd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                      {s.adminNote && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> Note de l'administration
                          </p>
                          <p className="text-sm text-slate-700">{s.adminNote}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {isAdmin && (
            <div>
              <h2 className="text-lg font-display font-bold mb-4 text-slate-900">Toutes les suggestions (Admin)</h2>
              {allLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
                </div>
              ) : !allSuggestions || allSuggestions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 text-sm">Aucune suggestion reçue.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allSuggestions.map((s: any) => {
                    const status = getStatusInfo(s.status);
                    return (
                      <div key={s.id} className="bg-white rounded-xl border border-slate-100 p-4 md:p-5" data-testid={`admin-suggestion-${s.id}`}>
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900">{s.title}</h3>
                            {s.description && <p className="text-sm text-slate-500 mt-1">{s.description}</p>}
                            {s.url && (
                              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">{s.url}</a>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {s.type && <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{RESOURCE_TYPE_LABELS[s.type] || s.type}</span>}
                              {s.discipline && <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{DISCIPLINE_LABELS[s.discipline] || s.discipline}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", status.color)}>
                              {status.label}
                            </span>
                            {s.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateMutation.mutate({ id: s.id, status: 'approved' })}
                                  className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors"
                                  title="Approuver"
                                  data-testid={`button-approve-suggestion-${s.id}`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => updateMutation.mutate({ id: s.id, status: 'rejected' })}
                                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
                                  title="Rejeter"
                                  data-testid={`button-reject-suggestion-${s.id}`}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
