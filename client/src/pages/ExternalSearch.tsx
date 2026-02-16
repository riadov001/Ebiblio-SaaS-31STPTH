import { useState, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useExternalSearch, useCreateResource, type ExternalSearchFilters } from "@/hooks/use-resources";
import { Search, Loader2, Plus, ExternalLink, SlidersHorizontal, X, BookOpen, FileText, Globe, ArrowUpDown, ChevronLeft, ChevronRight, Calendar, User, Tag, Languages, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const LANGUAGES = [
  { value: '', label: 'Toutes les langues' },
  { value: 'fre', label: 'Français' },
  { value: 'eng', label: 'Anglais' },
  { value: 'spa', label: 'Espagnol' },
  { value: 'por', label: 'Portugais' },
  { value: 'ger', label: 'Allemand' },
  { value: 'ara', label: 'Arabe' },
  { value: 'chi', label: 'Chinois' },
  { value: 'rus', label: 'Russe' },
];

const SUBJECTS = [
  { value: '', label: 'Toutes les disciplines' },
  { value: 'science', label: 'Sciences' },
  { value: 'medicine', label: 'Médecine' },
  { value: 'law', label: 'Droit' },
  { value: 'theology', label: 'Théologie' },
  { value: 'economics', label: 'Économie' },
  { value: 'engineering', label: 'Ingénierie' },
  { value: 'mathematics', label: 'Mathématiques' },
  { value: 'history', label: 'Histoire' },
  { value: 'philosophy', label: 'Philosophie' },
  { value: 'psychology', label: 'Psychologie' },
  { value: 'education', label: 'Éducation' },
  { value: 'computer science', label: 'Informatique' },
  { value: 'sociology', label: 'Sociologie' },
  { value: 'literature', label: 'Littérature' },
  { value: 'political science', label: 'Sciences politiques' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'newest', label: 'Plus récent' },
  { value: 'oldest', label: 'Plus ancien' },
  { value: 'title', label: 'Titre (A-Z)' },
];

export default function ExternalSearch() {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<ExternalSearchFilters>({
    q: '',
    source: 'all',
    sort: 'relevance',
    page: 1,
    limit: 20,
  });
  const [activeFilters, setActiveFilters] = useState<ExternalSearchFilters>({
    q: '',
    source: 'all',
    sort: 'relevance',
    page: 1,
    limit: 20,
  });

  const { data, isLoading, isFetching } = useExternalSearch(activeFilters);
  const results = data?.results || [];
  const totalResults = data?.totalResults || 0;
  const currentPage = data?.page || 1;
  const totalPages = data?.totalPages || 0;

  const [category, setCategory] = useState<'all' | 'book' | 'article'>('all');
  const filteredResults = results.filter((item: any) =>
    category === 'all' || item.type === category
  );

  const createMutation = useCreateResource();
  const { toast } = useToast();

  const handleSearch = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    const newFilters = { ...filters, q: query.trim(), page: 1 };
    setFilters(newFilters);
    setActiveFilters(newFilters);
  }, [query, filters]);

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...activeFilters, page: newPage };
    setActiveFilters(newFilters);
    setFilters(newFilters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = (item: any) => {
    createMutation.mutate({
      title: item.title,
      author: item.author,
      description: item.abstract || `Importé depuis ${item.source}`,
      type: item.type === 'book' ? 'book' : 'article',
      source: item.source.toLowerCase(),
      externalId: item.externalId,
      url: item.url,
      publicationYear: item.year,
    }, {
      onSuccess: () => {
        setSavedItems(prev => new Set(prev).add(item.externalId));
        toast({ title: "Enregistré", description: `"${item.title}" ajouté à votre bibliothèque.` });
      }
    });
  };

  const resetFilters = () => {
    const reset: ExternalSearchFilters = {
      q: query,
      source: 'all',
      sort: 'relevance',
      page: 1,
      limit: 20,
    };
    setFilters(reset);
    setCategory('all');
  };

  const activeFilterCount = [
    filters.author,
    filters.yearFrom,
    filters.yearTo,
    filters.language,
    filters.subject,
    filters.source !== 'all' ? filters.source : undefined,
    filters.sort !== 'relevance' ? filters.sort : undefined,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="max-w-4xl mx-auto mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-2 leading-tight" data-testid="text-page-title">
            Recherche Avancée de Ressources
          </h1>
          <p className="text-sm md:text-base text-slate-500" data-testid="text-page-subtitle">
            Explorez des millions de livres et articles académiques via OpenLibrary et DOAJ.
          </p>
        </header>

        <div className="max-w-4xl mx-auto mb-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2" data-testid="form-search">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                className="pl-10 h-11"
                placeholder="Titre, auteur, ISBN, mot-clé..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-testid="input-search-query"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!query.trim()} className="flex-1 sm:flex-none" data-testid="button-search">
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn("relative flex-1 sm:flex-none", showFilters && "toggle-elevate toggle-elevated")}
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filtres
                {activeFilterCount > 0 && (
                  <Badge variant="default" className="ml-1.5 px-1.5 py-0 text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </div>
          </form>

          {showFilters && (
            <Card className="mt-3 p-4" data-testid="panel-advanced-filters">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-slate-700">Filtres avancés</h3>
                <Button variant="ghost" size="sm" onClick={resetFilters} data-testid="button-reset-filters">
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Réinitialiser
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    Source
                  </label>
                  <Select value={filters.source} onValueChange={(v) => setFilters(f => ({ ...f, source: v as any }))}>
                    <SelectTrigger data-testid="select-source">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les sources</SelectItem>
                      <SelectItem value="openlibrary">OpenLibrary (Livres)</SelectItem>
                      <SelectItem value="doaj">DOAJ (Articles)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Auteur
                  </label>
                  <Input
                    placeholder="Nom de l'auteur..."
                    value={filters.author || ''}
                    onChange={(e) => setFilters(f => ({ ...f, author: e.target.value || undefined }))}
                    data-testid="input-filter-author"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    Discipline
                  </label>
                  <Select value={filters.subject || 'all-subjects'} onValueChange={(v) => setFilters(f => ({ ...f, subject: v === 'all-subjects' ? undefined : v }))}>
                    <SelectTrigger data-testid="select-subject">
                      <SelectValue placeholder="Toutes les disciplines" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => (
                        <SelectItem key={s.value || 'all-subjects'} value={s.value || 'all-subjects'}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5" />
                    Langue
                  </label>
                  <Select value={filters.language || 'all-languages'} onValueChange={(v) => setFilters(f => ({ ...f, language: v === 'all-languages' ? undefined : v }))}>
                    <SelectTrigger data-testid="select-language">
                      <SelectValue placeholder="Toutes les langues" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(l => (
                        <SelectItem key={l.value || 'all-languages'} value={l.value || 'all-languages'}>{l.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Année de publication
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="De"
                      min={1800}
                      max={new Date().getFullYear()}
                      value={filters.yearFrom || ''}
                      onChange={(e) => setFilters(f => ({ ...f, yearFrom: e.target.value ? Number(e.target.value) : undefined }))}
                      data-testid="input-year-from"
                    />
                    <Input
                      type="number"
                      placeholder="À"
                      min={1800}
                      max={new Date().getFullYear()}
                      value={filters.yearTo || ''}
                      onChange={(e) => setFilters(f => ({ ...f, yearTo: e.target.value ? Number(e.target.value) : undefined }))}
                      data-testid="input-year-to"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Trier par
                  </label>
                  <Select value={filters.sort || 'relevance'} onValueChange={(v) => setFilters(f => ({ ...f, sort: v as any }))}>
                    <SelectTrigger data-testid="select-sort">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                <Button onClick={() => handleSearch()} disabled={!query.trim()} data-testid="button-apply-filters">
                  Appliquer les filtres
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider mr-1">Type :</span>
            {[
              { id: 'all', label: 'Tout', icon: Globe },
              { id: 'book', label: 'Livres', icon: BookOpen },
              { id: 'article', label: 'Articles', icon: FileText },
            ].map((c) => (
              <Button
                key={c.id}
                variant={category === c.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c.id as any)}
                data-testid={`button-type-${c.id}`}
              >
                <c.icon className="w-3.5 h-3.5 mr-1.5" />
                {c.label}
              </Button>
            ))}

            {totalResults > 0 && (
              <span className="ml-auto text-sm text-slate-500" data-testid="text-result-count">
                {totalResults.toLocaleString('fr-FR')} résultat{totalResults > 1 ? 's' : ''} trouvé{totalResults > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {(isLoading || isFetching) ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-sm text-slate-500">Recherche en cours...</p>
            </div>
          ) : activeFilters.q && results.length > 0 ? (
            <>
              <div className="grid gap-3">
                {filteredResults.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-slate-500" data-testid="text-no-type-results">Aucun résultat pour ce type de ressource.</p>
                  </Card>
                ) : (
                  filteredResults.map((item: any, idx: number) => (
                    <Card
                      key={`${item.externalId}-${idx}`}
                      className="p-4 hover-elevate"
                      data-testid={`card-result-${idx}`}
                    >
                      <div className="flex gap-4">
                        <div className="hidden sm:block">
                          {item.coverUrl ? (
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className="w-20 h-28 object-cover rounded-md shadow-sm bg-slate-100 shrink-0"
                              data-testid={`img-cover-${idx}`}
                            />
                          ) : (
                            <div className="w-20 h-28 bg-slate-100 rounded-md flex items-center justify-center shrink-0">
                              {item.type === 'book' ? (
                                <BookOpen className="w-8 h-8 text-slate-300" />
                              ) : (
                                <FileText className="w-8 h-8 text-slate-300" />
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5 mb-1">
                            <Badge
                              variant={item.source === 'openlibrary' ? 'secondary' : 'outline'}
                              className="text-[10px]"
                              data-testid={`badge-source-${idx}`}
                            >
                              {item.source === 'openlibrary' ? 'OpenLibrary' : 'DOAJ'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">
                              {item.type === 'book' ? 'Livre' : 'Article'}
                            </Badge>
                            {item.language && (
                              <Badge variant="outline" className="text-[10px]">
                                {item.language}
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-snug mb-0.5 line-clamp-2" data-testid={`text-title-${idx}`}>
                            {item.title}
                          </h3>

                          <p className="text-sm text-slate-600 mb-0.5" data-testid={`text-author-${idx}`}>
                            {item.author}
                            {item.year && <span className="text-slate-400"> ({item.year})</span>}
                          </p>

                          {item.journal && (
                            <p className="text-xs text-slate-400 mb-0.5">
                              {item.journal}
                            </p>
                          )}

                          {item.publisher && (
                            <p className="text-xs text-slate-400 mb-1">
                              {item.publisher}
                            </p>
                          )}

                          {item.abstract && (
                            <p className="text-xs text-slate-500 line-clamp-2 mb-1.5 hidden sm:block" data-testid={`text-abstract-${idx}`}>
                              {item.abstract}
                            </p>
                          )}

                          {item.subject && item.subject.length > 0 && (
                            <div className="flex flex-wrap gap-1 hidden sm:flex">
                              {item.subject.slice(0, 4).map((s: string, si: number) => (
                                <span key={si} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                  {s.length > 30 ? s.substring(0, 30) + '...' : s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <Button
                            size="icon"
                            variant={savedItems.has(item.externalId) ? "default" : "outline"}
                            onClick={() => handleSave(item)}
                            disabled={createMutation.isPending || savedItems.has(item.externalId)}
                            title={savedItems.has(item.externalId) ? "Déjà enregistré" : "Enregistrer dans la bibliothèque"}
                            data-testid={`button-save-${idx}`}
                          >
                            {createMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : savedItems.has(item.externalId) ? (
                              <BookOpen className="w-4 h-4" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </Button>
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              <Button size="icon" variant="ghost" title="Ouvrir la source" data-testid={`button-open-${idx}`}>
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6 mb-8" data-testid="nav-pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Précédent</span>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          data-testid={`button-page-${pageNum}`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    data-testid="button-next-page"
                  >
                    <span className="hidden sm:inline">Suivant</span>
                    <ChevronRight className="w-4 h-4 sm:ml-1" />
                  </Button>
                </div>
              )}
            </>
          ) : activeFilters.q && results.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-600 font-medium mb-1" data-testid="text-no-results">Aucun résultat trouvé</p>
              <p className="text-sm text-slate-400">Essayez de modifier vos filtres ou d'utiliser d'autres mots-clés.</p>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Search className="w-8 h-8 text-primary" />
              </div>
              <p className="text-slate-600 font-medium mb-1" data-testid="text-search-prompt">Lancez une recherche</p>
              <p className="text-sm text-slate-400">
                Entrez un titre, un auteur ou un mot-clé pour explorer les ressources académiques mondiales.
              </p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
