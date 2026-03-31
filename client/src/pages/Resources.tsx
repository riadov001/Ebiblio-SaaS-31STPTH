import { useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { ResourceCard } from "@/components/ResourceCard";
import { useResources } from "@/hooks/use-resources";
import { RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS } from "@shared/schema";
import { Search, Filter, Library, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Resources() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showDisciplines, setShowDisciplines] = useState(false);
  
  const { data: resources, isLoading } = useResources({ 
    status: 'approved',
    type: typeFilter === 'all' ? undefined : typeFilter,
    discipline: disciplineFilter === 'all' ? undefined : disciplineFilter,
  });

  const filteredResources = resources?.filter((r: any) => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.author?.toLowerCase().includes(search.toLowerCase())
  );

  const typeFilters = [
    { id: 'all', label: 'Toutes' },
    { id: 'book', label: 'Livres' },
    { id: 'article', label: 'Articles' },
    { id: 'journal', label: 'Revues' },
    { id: 'thesis', label: 'Thèses' },
    { id: 'database', label: 'Bases de données' },
    { id: 'archive', label: 'Archives' },
    { id: 'manual', label: 'Manuels' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-14 md:pt-8 overflow-x-hidden">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight truncate" data-testid="text-catalog-title">
              Catalogue de la Bibliothèque
            </h1>
            <p className="text-slate-500 mt-1 text-xs sm:text-sm md:text-base truncate">
              Parcourez les ressources approuvées de toutes les collections
            </p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Titre ou auteur..." 
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="input-search-catalog"
              />
            </div>
          </div>
        </header>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {typeFilters.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={cn(
                "px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                typeFilter === tab.id 
                  ? "bg-primary text-white shadow-md shadow-primary/25" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
              data-testid={`button-type-${tab.id}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowDisciplines(!showDisciplines)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
            data-testid="button-toggle-disciplines"
          >
            <Filter className="w-4 h-4" />
            Filtrer par discipline
            <ChevronDown className={cn("w-4 h-4 transition-transform", showDisciplines && "rotate-180")} />
          </button>
          {showDisciplines && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth flex-wrap">
              <button
                onClick={() => setDisciplineFilter('all')}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
                  disciplineFilter === 'all'
                    ? "bg-secondary text-primary border border-secondary"
                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                )}
              >
                Toutes
              </button>
              {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setDisciplineFilter(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0",
                    disciplineFilter === key
                      ? "bg-secondary text-primary border border-secondary"
                      : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                  )}
                  data-testid={`button-discipline-${key}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-white rounded-xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : filteredResources?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Aucune ressource trouvée</h3>
            <p className="text-slate-500 text-sm">Essayez d'ajuster vos filtres ou votre recherche.</p>
            <Link href="/search">
              <button className="mt-4 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium" data-testid="link-external-search">
                Rechercher des ressources externes
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {filteredResources?.map((resource: any) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
