import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useCreateResource } from "@/hooks/use-resources";
import { RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS, SOURCE_LABELS } from "@shared/schema";
import { Upload, Send, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SubmitResource() {
  const [, navigate] = useLocation();
  const createMutation = useCreateResource();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    type: 'book',
    source: 'internal',
    discipline: '',
    language: 'fr',
    url: '',
    isbn: '',
    publisher: '',
    publicationYear: undefined as number | undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    createMutation.mutate({
      title: formData.title,
      author: formData.author || undefined,
      description: formData.description || undefined,
      type: formData.type,
      source: formData.source,
      discipline: formData.discipline || undefined,
      language: formData.language || 'fr',
      url: formData.url || undefined,
      isbn: formData.isbn || undefined,
      publisher: formData.publisher || undefined,
      publicationYear: formData.publicationYear || undefined,
    }, {
      onSuccess: () => {
        navigate('/resources');
      }
    });
  };

  const update = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="mb-6 md:mb-8">
          <Link href="/resources">
            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-4 transition-colors" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" /> Retour au catalogue
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight" data-testid="text-submit-title">
                Soumettre une Ressource
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Ajoutez une nouvelle ressource à la bibliothèque. Elle sera examinée par un administrateur.
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Titre de la ressource *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => update('title', e.target.value)}
                  required
                  placeholder="Ex: Introduction au Droit Civil Congolais"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Auteur(s)</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => update('author', e.target.value)}
                  placeholder="Ex: Prof. Jean Mukendi"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-author"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Éditeur / Publication</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => update('publisher', e.target.value)}
                  placeholder="Ex: Éditions UPC"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-publisher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type de ressource *</label>
                <select
                  value={formData.type}
                  onChange={(e) => update('type', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-type"
                >
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => update('source', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-source"
                >
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Discipline</label>
                <select
                  value={formData.discipline}
                  onChange={(e) => update('discipline', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-discipline"
                >
                  <option value="">-- Sélectionner --</option>
                  {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Langue</label>
                <select
                  value={formData.language}
                  onChange={(e) => update('language', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-language"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="lingala">Lingala</option>
                  <option value="swahili">Swahili</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Année de publication</label>
                <input
                  type="number"
                  value={formData.publicationYear || ''}
                  onChange={(e) => update('publicationYear', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 2024"
                  min={1900}
                  max={2100}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-year"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ISBN (si applicable)</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => update('isbn', e.target.value)}
                  placeholder="978-..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-isbn"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL / Lien vers la ressource</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => update('url', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-url"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Décrivez brièvement le contenu de cette ressource..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                  data-testid="input-resource-description"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={createMutation.isPending || !formData.title.trim()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/25 hover:shadow-lg transition-all disabled:opacity-50"
                data-testid="button-submit-resource"
              >
                <Send className="w-4 h-4" />
                {createMutation.isPending ? "Envoi en cours..." : "Soumettre pour approbation"}
              </button>
              <Link href="/resources">
                <button
                  type="button"
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Comment fonctionne la soumission ?</p>
              <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">
                Votre ressource sera soumise avec le statut "En attente". Un professeur, directeur ou administrateur examinera et approuvera votre soumission. 
                Vous gagnerez <strong>50 points</strong> pour chaque ressource approuvée !
              </p>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
