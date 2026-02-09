import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useExternalSearch, useCreateResource } from "@/hooks/use-resources";
import { Search, Loader2, Plus, Check, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function ExternalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [source, setSource] = useState<'all' | 'openlibrary' | 'doaj'>('all');
  const [category, setCategory] = useState<'all' | 'book' | 'article'>('all');
  
  const { data: results, isLoading } = useExternalSearch(debouncedQuery, source);

  // Client-side filtering by category
  const filteredResults = results?.filter(item => 
    category === 'all' || item.type === category
  );
  const createMutation = useCreateResource();
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
  };

  const handleSave = (item: any) => {
    createMutation.mutate({
      title: item.title,
      author: item.author,
      description: `Imported from ${item.source}`,
      type: item.type === 'book' ? 'book' : 'article',
      source: item.source.toLowerCase(),
      externalId: item.externalId,
      url: item.url,
      publicationYear: item.year,
      status: 'pending', // Default to pending approval
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        <header className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Recherche dans les Bases de Données Externes</h1>
          <p className="text-slate-500">Recherchez parmi des millions de livres et d'articles d'OpenLibrary et DOAJ.</p>
        </header>

        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input 
              className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all pl-14"
              placeholder="Rechercher par titre, auteur ou ISBN..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary py-2 px-6 h-auto"
            >
              Rechercher
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</span>
              <div className="flex gap-3">
                {['all', 'openlibrary', 'doaj'].map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="source" 
                      checked={source === s} 
                      onChange={() => setSource(s as any)}
                      className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                    />
                    <span className={cn(
                      "capitalize text-sm font-medium transition-colors",
                      source === s ? "text-primary" : "text-slate-500 group-hover:text-slate-700"
                    )}>
                      {s === 'all' ? 'Toutes' : s}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="w-px h-10 bg-slate-200 hidden sm:block" />

            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catégorie</span>
              <div className="flex gap-3">
                {[
                  { id: 'all', label: 'Toutes' },
                  { id: 'book', label: 'Livres' },
                  { id: 'article', label: 'Articles' }
                ].map((c) => (
                  <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={category === c.id} 
                      onChange={() => setCategory(c.id as any)}
                      className="w-4 h-4 text-primary focus:ring-primary border-slate-300" 
                    />
                    <span className={cn(
                      "capitalize text-sm font-medium transition-colors",
                      category === c.id ? "text-primary" : "text-slate-500 group-hover:text-slate-700"
                    )}>
                      {c.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : filteredResults ? (
            <div className="grid gap-4">
              {filteredResults.length === 0 ? (
                <div className="text-center text-slate-500 py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                  Aucun résultat trouvé pour cette catégorie.
                </div>
              ) : (
                filteredResults.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-4 hover:shadow-md transition-shadow">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt="Cover" className="w-20 h-28 object-cover rounded shadow-sm bg-slate-100" />
                    ) : (
                      <div className="w-20 h-28 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-xs text-center p-2">
                        Pas d'image
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded mb-2 inline-block",
                          item.source === 'openlibrary' ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                        )}>
                          {item.source}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{item.title}</h3>
                      <p className="text-slate-600 text-sm mb-1">{item.author}</p>
                      {item.year && <p className="text-slate-400 text-xs">{item.year}</p>}
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button 
                        onClick={() => handleSave(item)}
                        disabled={createMutation.isPending}
                        className="btn-secondary h-10 w-10 p-0 rounded-full flex items-center justify-center"
                        title="Enregistrer dans la bibliothèque"
                      >
                        {createMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                      {item.url && (
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-10 w-10 p-0 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 transition-colors"
                          title="Télécharger / Consulter"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-center py-20 opacity-50">
              <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p>Entrez un terme de recherche pour trouver des ressources</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
