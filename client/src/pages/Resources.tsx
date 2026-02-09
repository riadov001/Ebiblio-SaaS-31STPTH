import { useState } from "react";
import { Link } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { ResourceCard } from "@/components/ResourceCard";
import { useResources } from "@/hooks/use-resources";
import { Search, Filter, Library } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Resources() {
  const [filter, setFilter] = useState<'all' | 'book' | 'article'>('all');
  const [search, setSearch] = useState('');
  
  // Only show approved resources in the main catalog
  const { data: resources, isLoading } = useResources({ 
    status: 'approved',
    type: filter === 'all' ? undefined : filter
  });

  const filteredResources = resources?.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.author?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight">Catalogue de la Bibliothèque</h1>
            <p className="text-slate-500 mt-1 text-sm md:text-base">Parcourez les ressources approuvées</p>
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
              />
            </div>
            <button className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shrink-0">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {['all', 'book', 'article'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={cn(
                "px-5 py-2 rounded-full text-xs md:text-sm font-semibold capitalize transition-all whitespace-nowrap shrink-0",
                filter === tab 
                  ? "bg-primary text-white shadow-md shadow-primary/25" 
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              {tab === 'all' ? 'Toutes' : tab === 'book' ? 'Livres' : 'Articles'}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
            <p className="text-slate-500">Essayez d'ajuster votre recherche ou vos filtres.</p>
            <Link href="/search">
              <button className="mt-4 btn-primary">Rechercher des ressources externes</button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredResources?.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
