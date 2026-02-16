import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ExternalLink, Search, Globe, BookOpen, FileText, GraduationCap, Database, Archive, Beaker, Scale, Stethoscope, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryId = 'all' | 'search' | 'preprints' | 'journals' | 'regional' | 'libraries' | 'theses' | 'tools' | 'networks' | 'specialized';

const categories: { id: CategoryId; label: string; icon: any }[] = [
  { id: 'all', label: 'Tout', icon: Globe },
  { id: 'search', label: 'Moteurs de recherche', icon: Search },
  { id: 'preprints', label: 'Préprints & Archives', icon: Archive },
  { id: 'journals', label: 'Revues Open Access', icon: BookOpen },
  { id: 'regional', label: 'Bases régionales', icon: Globe },
  { id: 'libraries', label: 'Bibliothèques', icon: Database },
  { id: 'theses', label: 'Thèses & Mémoires', icon: GraduationCap },
  { id: 'tools', label: "Outils d'accès", icon: BookMarked },
  { id: 'networks', label: 'Réseaux académiques', icon: FileText },
  { id: 'specialized', label: 'Spécialisés', icon: Beaker },
];

const sources = [
  { name: "CORE", url: "https://core.ac.uk/", description: "Plus grande collection d'articles en libre accès au monde", category: "search" },
  { name: "DOAJ", url: "https://doaj.org/", description: "Répertoire des revues en libre accès de qualité", category: "search" },
  { name: "ERIC", url: "https://eric.ed.gov/", description: "Base de données sur l'éducation et les sciences de l'éducation", category: "search" },
  { name: "Semantic Scholar", url: "https://www.semanticscholar.org/", description: "Moteur de recherche scientifique alimenté par l'IA", category: "search" },
  { name: "BASE", url: "https://www.base-search.net/", description: "Bielefeld Academic Search Engine - moteur académique allemand", category: "search" },
  { name: "WorldWideScience", url: "https://worldwidescience.org/", description: "Portail mondial de la science et de la recherche", category: "search" },

  { name: "arXiv", url: "https://arxiv.org/", description: "Préprints en physique, mathématiques, informatique et plus", category: "preprints" },
  { name: "bioRxiv", url: "https://www.biorxiv.org/", description: "Serveur de préprints pour les sciences biologiques", category: "preprints" },
  { name: "PsyArXiv", url: "https://psyarxiv.com/", description: "Préprints en psychologie et sciences connexes", category: "preprints" },
  { name: "SSRN", url: "https://www.ssrn.com/", description: "Réseau de recherche en sciences sociales", category: "preprints" },
  { name: "OSF Preprints", url: "https://osf.io/preprints/", description: "Plateforme ouverte pour tous les préprints", category: "preprints" },
  { name: "HAL Archives", url: "https://hal.science/", description: "Archive ouverte pluridisciplinaire française", category: "preprints" },

  { name: "PLOS", url: "https://plos.org/", description: "Revues en libre accès couvrant toutes les sciences", category: "journals" },
  { name: "SpringerOpen", url: "https://www.springeropen.com/", description: "Revues et livres open access de Springer", category: "journals" },
  { name: "Hindawi", url: "https://www.hindawi.com/", description: "Éditeur de revues en accès ouvert évalué par les pairs", category: "journals" },
  { name: "MDPI", url: "https://www.mdpi.com/", description: "Éditeur de revues scientifiques en libre accès", category: "journals" },
  { name: "Wiley Open Access", url: "https://www.wiley.com/en-us/open-access", description: "Publications en accès ouvert de Wiley", category: "journals" },
  { name: "Nature Communications", url: "https://www.nature.com/ncomms/", description: "Revue multidisciplinaire en libre accès de Nature", category: "journals" },
  { name: "ScienceOpen", url: "https://www.scienceopen.com/", description: "Plateforme interactive de publication scientifique ouverte", category: "journals" },

  { name: "SciELO", url: "https://scielo.org/", description: "Bibliothèque scientifique électronique d'Amérique latine", category: "regional" },
  { name: "Redalyc", url: "https://www.redalyc.org/", description: "Réseau de revues scientifiques d'Amérique latine et Caraïbes", category: "regional" },
  { name: "AJOL", url: "https://www.ajol.info/", description: "African Journals Online - Revues académiques africaines", category: "regional" },

  { name: "JSTOR (gratuit partiel)", url: "https://www.jstor.org/", description: "Bibliothèque numérique avec accès libre à certains contenus", category: "libraries" },
  { name: "PubMed Central", url: "https://pubmed.ncbi.nlm.nih.gov/", description: "Archive gratuite d'articles biomédicaux et sciences de la vie", category: "libraries" },
  { name: "Internet Archive", url: "https://archive.org/", description: "Bibliothèque numérique universelle avec millions de ressources", category: "libraries" },
  { name: "OpenLibrary", url: "https://openlibrary.org/", description: "Bibliothèque universelle libre avec catalogue mondial de livres", category: "libraries" },

  { name: "EThOS", url: "https://ethos.bl.uk/", description: "Service national de thèses du Royaume-Uni", category: "theses" },
  { name: "OATD", url: "https://oatd.org/", description: "Open Access Theses and Dissertations mondiales", category: "theses" },
  { name: "EBSCO Open Dissertations", url: "https://opendissertations.org/", description: "Base de thèses et mémoires en accès libre", category: "theses" },

  { name: "Unpaywall", url: "https://unpaywall.org/", description: "Extension navigateur pour trouver les versions libres d'articles", category: "tools" },
  { name: "PaperPanda", url: "https://paperpanda.app/", description: "Extension pour accéder facilement aux articles scientifiques", category: "tools" },
  { name: "Zenodo", url: "https://zenodo.org/", description: "Dépôt de recherche en libre accès du CERN", category: "tools" },
  { name: "OpenAIRE", url: "https://www.openaire.eu/", description: "Infrastructure européenne pour la recherche ouverte", category: "tools" },

  { name: "ResearchGate", url: "https://www.researchgate.net/", description: "Réseau social pour chercheurs et scientifiques", category: "networks" },
  { name: "Academia.edu", url: "https://www.academia.edu/", description: "Plateforme de partage de travaux académiques", category: "networks" },

  { name: "PhilPapers", url: "https://philpapers.org/", description: "Base de données complète en philosophie", category: "specialized" },
  { name: "Research4Life", url: "https://www.research4life.org/", description: "Accès gratuit aux publications pour les pays en développement", category: "specialized" },
  { name: "Cambridge Open Engage", url: "https://www.cambridge.org/engage/", description: "Plateforme de prépublication de Cambridge", category: "specialized" },
  { name: "Digital Commons", url: "https://network.bepress.com/", description: "Réseau de dépôts institutionnels et revues", category: "specialized" },
  { name: "Citationsy Archives", url: "https://citationsy.com/archives/", description: "Outil de gestion de citations avec archive ouverte", category: "specialized" },
];

export default function AcademicSources() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = sources.filter(s => {
    const matchCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch = !searchQuery || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8 overflow-x-hidden">
        <header className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight" data-testid="text-sources-title">
            Annuaire des Sources Académiques
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-2">
            Accédez directement à {sources.length} bases de données et plateformes de recherche en libre accès.
          </p>
        </header>

        <div className="relative w-full max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Filtrer les sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            data-testid="input-search-sources"
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all whitespace-nowrap shrink-0",
                activeCategory === cat.id
                  ? "bg-primary text-white shadow-md shadow-primary/25"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
              data-testid={`button-category-${cat.id}`}
            >
              <cat.icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl border border-slate-100 p-4 sm:p-5 flex flex-col gap-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300 min-w-0"
              data-testid={`card-source-${source.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display font-bold text-base text-slate-900 group-hover:text-primary transition-colors leading-tight">
                  {source.name}
                </h3>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary shrink-0 mt-0.5 transition-colors" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed flex-1">{source.description}</p>
              <div className="mt-auto">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full",
                  source.category === 'search' ? "bg-blue-50 text-blue-600" :
                  source.category === 'preprints' ? "bg-purple-50 text-purple-600" :
                  source.category === 'journals' ? "bg-green-50 text-green-600" :
                  source.category === 'regional' ? "bg-orange-50 text-orange-600" :
                  source.category === 'libraries' ? "bg-indigo-50 text-indigo-600" :
                  source.category === 'theses' ? "bg-pink-50 text-pink-600" :
                  source.category === 'tools' ? "bg-teal-50 text-teal-600" :
                  source.category === 'networks' ? "bg-cyan-50 text-cyan-600" :
                  "bg-slate-50 text-slate-600"
                )}>
                  {categories.find(c => c.id === source.category)?.label}
                </span>
              </div>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">Aucune source trouvée</h3>
            <p className="text-slate-500 text-sm">Essayez un autre filtre ou terme de recherche.</p>
          </div>
        )}
      </main>
    </div>
  );
}
