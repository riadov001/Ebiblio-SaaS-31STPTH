import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import {
  BookOpen, LayoutDashboard, Library, Upload, Search, Globe, Lightbulb,
  Award, CheckSquare, Shield, Users, ChevronDown, ChevronRight,
  ArrowRight, Star, Zap, Lock, FileText, Database, Settings,
  HelpCircle, ExternalLink, BookMarked, Layers, BarChart3, Download
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionId = 'overview' | 'dashboard' | 'catalog' | 'submit' | 'search' | 'sources' | 'suggestions' | 'rewards' | 'approvals' | 'admin' | 'roles' | 'points' | 'faq' | 'architecture' | 'datamodel' | 'apiref' | 'security';

interface DocSection {
  id: SectionId;
  title: string;
  icon: any;
  color: string;
  bg: string;
}

const sections: DocSection[] = [
  { id: 'overview', title: "Presentation Generale", icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
  { id: 'dashboard', title: "Tableau de Bord", icon: LayoutDashboard, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: 'catalog', title: "Catalogue", icon: Library, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: 'submit', title: "Soumettre une Ressource", icon: Upload, color: "text-cyan-600", bg: "bg-cyan-50" },
  { id: 'search', title: "Recherche Externe", icon: Search, color: "text-violet-600", bg: "bg-violet-50" },
  { id: 'sources', title: "Sources Academiques", icon: Globe, color: "text-teal-600", bg: "bg-teal-50" },
  { id: 'suggestions', title: "Suggestions", icon: Lightbulb, color: "text-amber-600", bg: "bg-amber-50" },
  { id: 'rewards', title: "Recompenses", icon: Award, color: "text-purple-600", bg: "bg-purple-50" },
  { id: 'approvals', title: "Approbations", icon: CheckSquare, color: "text-green-600", bg: "bg-green-50" },
  { id: 'admin', title: "Super Admin", icon: Shield, color: "text-red-600", bg: "bg-red-50" },
  { id: 'roles', title: "Roles et Permissions", icon: Users, color: "text-orange-600", bg: "bg-orange-50" },
  { id: 'points', title: "Systeme de Points", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: 'faq', title: "Questions Frequentes", icon: HelpCircle, color: "text-slate-600", bg: "bg-slate-100" },
  { id: 'architecture', title: "Architecture Technique", icon: Layers, color: "text-sky-600", bg: "bg-sky-50" },
  { id: 'datamodel', title: "Modele de Donnees", icon: Database, color: "text-pink-600", bg: "bg-pink-50" },
  { id: 'apiref', title: "Reference API", icon: ExternalLink, color: "text-lime-600", bg: "bg-lime-50" },
  { id: 'security', title: "Securite & Abonnements", icon: Lock, color: "text-rose-600", bg: "bg-rose-50" },
];

function ScreenshotPlaceholder({ title, description, steps }: { title: string; description: string; steps: { label: string; desc: string }[] }) {
  return (
    <Card className="p-5 border-slate-200 bg-slate-50/50">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-slate-400" />
        <h4 className="font-semibold text-sm text-slate-700">{title}</h4>
      </div>
      <p className="text-sm text-slate-500 mb-4">{description}</p>
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-slate-100">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
              {idx + 1}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{step.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function FeatureHighlight({ icon: Icon, title, description, color, bg }: { icon: any; title: string; description: string; color: string; bg: string }) {
  return (
    <div className={cn("p-4 rounded-xl border border-slate-100 flex items-start gap-3", bg)}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg, color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{title}</p>
        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover-elevate"
        data-testid={`button-collapse-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      >
        <span className="font-semibold text-sm text-slate-800">{title}</span>
        <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-slate-100 pt-3">{children}</div>}
    </div>
  );
}

export default function Documentation() {
  const { user } = useAuth();
  const userRole = (user as any)?.role || 'student';
  const [activeSection, setActiveSection] = useState<SectionId>('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Bienvenue sur E-Biblio</h2>
              <p className="text-slate-600 leading-relaxed">
                E-Biblio est une plateforme de bibliotheque numerique multi-tenant concue pour les universites. 
                Elle permet aux etudiants de decouvrir, rechercher et soumettre des ressources academiques, 
                tandis que les professeurs et directeurs approuvent les soumissions. Le systeme inclut un 
                mecanisme de points et recompenses pour encourager la participation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureHighlight icon={Library} title="Catalogue Complet" description="Parcourez les ressources approuvees avec filtres par type et discipline." color="text-blue-600" bg="bg-blue-50" />
              <FeatureHighlight icon={Search} title="Recherche Mondiale" description="Recherchez dans OpenLibrary et DOAJ pour trouver des ressources en libre acces." color="text-violet-600" bg="bg-violet-50" />
              <FeatureHighlight icon={Globe} title="40+ Sources Academiques" description="Repertoire curate de bases de donnees academiques en libre acces dans 9 categories." color="text-teal-600" bg="bg-teal-50" />
              <FeatureHighlight icon={Award} title="Systeme de Points" description="Gagnez des points en contribuant et echangez-les contre des recompenses." color="text-purple-600" bg="bg-purple-50" />
              <FeatureHighlight icon={Upload} title="Soumission de Ressources" description="Ajoutez des ressources avec un flux d'approbation complet." color="text-cyan-600" bg="bg-cyan-50" />
              <FeatureHighlight icon={Shield} title="Multi-Tenant" description="Support de plusieurs bibliotheques universitaires avec isolation des donnees." color="text-red-600" bg="bg-red-50" />
            </div>

            <ScreenshotPlaceholder
              title="Page d'accueil - Connexion"
              description="L'ecran d'accueil de E-Biblio avec le bouton de connexion via Replit Auth."
              steps={[
                { label: "Accedez a l'application", desc: "Ouvrez l'URL de E-Biblio dans votre navigateur." },
                { label: "Cliquez sur 'Commencer'", desc: "Le bouton bleu en haut a droite vous redirige vers la connexion." },
                { label: "Authentifiez-vous", desc: "Connectez-vous avec votre compte Replit pour acceder a la plateforme." }
              ]}
            />
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Tableau de Bord</h2>
              <p className="text-slate-600 leading-relaxed">
                Le tableau de bord est votre page d'accueil apres la connexion. Il vous donne une vue d'ensemble 
                de l'activite de la bibliotheque et de votre progression personnelle.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Statistiques en haut de page"
              description="Quatre cartes de statistiques avec icones et couleurs distinctes."
              steps={[
                { label: "Total Ressources", desc: "Nombre total de ressources dans la bibliotheque (icone bleue)." },
                { label: "Approuvees", desc: "Nombre de ressources validees par les administrateurs (icone verte)." },
                { label: "En Attente", desc: "Ressources soumises non encore examinees (icone orange)." },
                { label: "Mes Points", desc: "Votre solde actuel de points accumules (icone violet)." }
              ]}
            />

            <ScreenshotPlaceholder
              title="Graphiques interactifs"
              description="Deux graphiques visuels pour comprendre la repartition des ressources."
              steps={[
                { label: "Ressources par Type", desc: "Graphique circulaire (camembert) montrant la proportion de livres, articles, revues, etc." },
                { label: "Top Disciplines", desc: "Graphique a barres horizontales montrant les 8 disciplines les plus representees." }
              ]}
            />

            <ScreenshotPlaceholder
              title="Actions Rapides & Ajouts Recents"
              description="Acces rapide aux fonctionnalites et liste des dernieres ressources."
              steps={[
                { label: "Soumettre une ressource", desc: "Lien direct vers le formulaire de soumission." },
                { label: "Faire une suggestion", desc: "Proposer une nouvelle ressource (+10 pts)." },
                { label: "Sources academiques", desc: "Acceder aux 40+ bases de donnees en libre acces." },
                { label: "Parcourir le catalogue", desc: "Explorer les ressources approuvees." },
                { label: "Ajouts Recents", desc: "Les 5 dernieres ressources ajoutees avec leur statut." }
              ]}
            />
          </div>
        );

      case 'catalog':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Catalogue de la Bibliotheque</h2>
              <p className="text-slate-600 leading-relaxed">
                Le catalogue contient toutes les ressources approuvees. Vous pouvez rechercher, filtrer et 
                explorer les ressources par type et discipline.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Barre de recherche et filtres"
              description="Outils de recherche et de filtrage en haut de la page."
              steps={[
                { label: "Recherche par texte", desc: "Tapez un titre ou un nom d'auteur dans la barre de recherche en haut a droite." },
                { label: "Filtres par type", desc: "Cliquez sur les boutons arrondis (Toutes, Livres, Articles, Revues, Theses, etc.) pour filtrer." },
                { label: "Filtrer par discipline", desc: "Cliquez sur 'Filtrer par discipline' pour derouler les 17 disciplines academiques." },
                { label: "Combiner les filtres", desc: "Selectionnez un type ET une discipline pour une recherche precise." }
              ]}
            />

            <ScreenshotPlaceholder
              title="Cartes de ressources"
              description="Chaque ressource est affichee sous forme de carte informative."
              steps={[
                { label: "Titre et auteur", desc: "Le titre de la ressource en gras avec l'auteur en dessous." },
                { label: "Type et discipline", desc: "Des badges colores indiquent le type (Livre, Article...) et la discipline." },
                { label: "Statut", desc: "Un indicateur colore montre le statut : Approuvee (vert), En attente (orange), Rejetee (rouge)." },
                { label: "Lien externe", desc: "Si disponible, un bouton pour ouvrir la ressource sur son site d'origine." }
              ]}
            />

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Types de ressources disponibles :</strong> Livre, Article, Revue, These, Base de donnees, Archive, Manuel, Autre.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <p className="text-sm text-green-800">
                <strong>17 Disciplines academiques :</strong> Droit, Medecine, Theologie, Informatique, Sciences Economiques, 
                Philosophie, Psychologie, Sciences Politiques, Sociologie, Histoire, Lettres, Mathematiques, Physique, 
                Chimie, Biologie, Agronomie, Communication.
              </p>
            </div>
          </div>
        );

      case 'submit':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Soumettre une Ressource</h2>
              <p className="text-slate-600 leading-relaxed">
                Contribuez a enrichir la bibliotheque en soumettant de nouvelles ressources academiques. 
                Chaque soumission approuvee vous rapporte 50 points.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Formulaire de soumission"
              description="Remplissez les champs suivants pour soumettre une ressource."
              steps={[
                { label: "Titre de la ressource *", desc: "Champ obligatoire. Entrez le titre complet de la ressource." },
                { label: "Auteur(s)", desc: "Nom de l'auteur ou des auteurs de la ressource." },
                { label: "Editeur / Publication", desc: "Nom de la maison d'edition ou de la publication." },
                { label: "Type de ressource *", desc: "Selectionnez : Livre, Article, Revue, These, Base de donnees, Archive, Manuel." },
                { label: "Source", desc: "Selectionnez la provenance : Interne, OpenLibrary, DOAJ, CORE, HAL, etc." },
                { label: "Discipline", desc: "Choisissez parmi les 17 disciplines academiques." },
                { label: "Langue", desc: "Francais, Anglais, Lingala, Swahili ou Autre." },
                { label: "Annee de publication", desc: "L'annee de publication si connue." },
                { label: "ISBN", desc: "Le numero ISBN si applicable (pour les livres)." },
                { label: "URL / Lien", desc: "L'adresse web de la ressource si disponible." },
                { label: "Description", desc: "Description libre du contenu de la ressource." }
              ]}
            />

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Processus d'approbation</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Apres soumission, votre ressource recoit le statut "En attente". Un professeur, directeur 
                  ou super admin examine puis approuve ou rejette la soumission. Vous etes notifie du resultat 
                  et recevez 50 points si la ressource est approuvee.
                </p>
              </div>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Recherche Externe</h2>
              <p className="text-slate-600 leading-relaxed">
                Recherchez dans les bases de donnees mondiales OpenLibrary (livres) et DOAJ 
                (articles scientifiques en libre acces) pour trouver des ressources.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Interface de recherche"
              description="La page de recherche externe avec ses options de filtrage."
              steps={[
                { label: "Barre de recherche", desc: "Entrez un titre, un auteur ou un ISBN. Cliquez sur 'Rechercher'." },
                { label: "Filtre par source", desc: "Choisissez : Toutes, OpenLibrary (livres) ou DOAJ (articles)." },
                { label: "Filtre par type", desc: "Filtrez les resultats : Tout, Livres ou Articles." },
                { label: "Resultats de recherche", desc: "Les resultats affichent une couverture, le titre, l'auteur, la source et l'annee." }
              ]}
            />

            <ScreenshotPlaceholder
              title="Enregistrer une ressource trouvee"
              description="Comment ajouter une ressource externe a votre bibliotheque."
              steps={[
                { label: "Bouton '+' (bleu)", desc: "Cliquez sur le bouton rond avec le '+' pour enregistrer la ressource dans la bibliotheque." },
                { label: "Bouton lien externe", desc: "Cliquez sur l'icone de lien pour ouvrir la ressource sur son site d'origine." },
                { label: "Badge de source", desc: "Un badge colore indique si la ressource vient d'OpenLibrary (orange) ou DOAJ (vert)." }
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800">OpenLibrary</h4>
                </div>
                <p className="text-xs text-slate-600">Bibliotheque universelle avec des millions de livres. Ideal pour les ouvrages, manuels et references bibliographiques.</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-semibold text-sm text-slate-800">DOAJ</h4>
                </div>
                <p className="text-xs text-slate-600">Directory of Open Access Journals. Plus de 20 000 revues et articles scientifiques en libre acces.</p>
              </Card>
            </div>
          </div>
        );

      case 'sources':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Sources Academiques</h2>
              <p className="text-slate-600 leading-relaxed">
                Un repertoire de plus de 40 bases de donnees et plateformes academiques en libre acces, 
                organisees en 9 categories pour faciliter vos recherches.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Navigation par categories"
              description="Utilisez les boutons de categories pour filtrer les sources."
              steps={[
                { label: "Barre de recherche", desc: "Recherchez une source par nom ou description." },
                { label: "Onglets de categories", desc: "Cliquez sur une categorie pour filtrer : Moteurs de recherche, Preprints, Revues, etc." },
                { label: "Carte de source", desc: "Chaque source affiche son nom, description et un lien direct vers le site." },
                { label: "Lien 'Visiter'", desc: "Cliquez pour ouvrir la source dans un nouvel onglet." }
              ]}
            />

            <div className="space-y-3">
              <h3 className="font-display font-bold text-lg text-slate-900">Les 9 Categories</h3>
              {[
                { icon: Search, label: "Moteurs de recherche", desc: "CORE, DOAJ, ERIC, Semantic Scholar, BASE, WorldWideScience", count: 6 },
                { icon: FileText, label: "Preprints & Archives", desc: "arXiv, bioRxiv, PsyArXiv, SSRN, OSF Preprints, HAL", count: 6 },
                { icon: BookOpen, label: "Revues Open Access", desc: "PLOS, SpringerOpen, Hindawi, MDPI, Wiley, Nature Communications, ScienceOpen", count: 7 },
                { icon: Globe, label: "Bases regionales", desc: "SciELO (Amerique latine), Redalyc, AJOL (Afrique)", count: 3 },
                { icon: Database, label: "Bibliotheques", desc: "JSTOR, PubMed Central, Internet Archive, OpenLibrary", count: 4 },
                { icon: BookMarked, label: "Theses & Memoires", desc: "EThOS, OATD, EBSCO Open Dissertations", count: 3 },
                { icon: Layers, label: "Outils d'acces", desc: "Unpaywall, PaperPanda, Zenodo, OpenAIRE", count: 4 },
                { icon: Users, label: "Reseaux academiques", desc: "ResearchGate, Academia.edu", count: 2 },
                { icon: Star, label: "Specialises", desc: "PhilPapers, Research4Life, Cambridge Open Engage, Digital Commons, Citationsy", count: 5 },
              ].map((cat) => (
                <Card key={cat.label} className="p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <cat.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{cat.label}</p>
                      <Badge variant="secondary" className="text-[10px]">{cat.count} sources</Badge>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{cat.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'suggestions':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Suggestions de Ressources</h2>
              <p className="text-slate-600 leading-relaxed">
                Proposez de nouvelles ressources a integrer dans la bibliotheque. Chaque suggestion soumise 
                vous rapporte 10 points, meme si elle n'est pas approuvee.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Creer une suggestion"
              description="Comment proposer une nouvelle ressource."
              steps={[
                { label: "Cliquez 'Nouvelle suggestion'", desc: "Le bouton bleu en haut a droite ouvre le formulaire." },
                { label: "Titre de la ressource *", desc: "Champ obligatoire. Decrivez la ressource que vous suggerez." },
                { label: "URL (optionnel)", desc: "Ajoutez un lien vers la ressource pour faciliter la verification." },
                { label: "Type et Discipline", desc: "Selectionnez le type et la discipline si connus." },
                { label: "Description", desc: "Expliquez pourquoi cette ressource serait utile." },
                { label: "Cliquez 'Envoyer'", desc: "Votre suggestion est soumise et vous gagnez 10 points." }
              ]}
            />

            <ScreenshotPlaceholder
              title="Suivi de vos suggestions"
              description="Suivez le statut de vos propositions."
              steps={[
                { label: "Mes suggestions", desc: "La section du haut affiche toutes vos suggestions personnelles." },
                { label: "Statut en attente (orange)", desc: "La suggestion n'a pas encore ete examinee." },
                { label: "Statut approuvee (vert)", desc: "La suggestion a ete acceptee par un administrateur." },
                { label: "Statut rejetee (rouge)", desc: "La suggestion n'a pas ete retenue." },
                { label: "Note de l'administration", desc: "Si un admin a laisse un commentaire, il apparait en dessous de la suggestion." }
              ]}
            />
          </div>
        );

      case 'rewards':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Recompenses</h2>
              <p className="text-slate-600 leading-relaxed">
                Echangez vos points accumules contre des avantages exclusifs. Les recompenses sont 
                creees par les administrateurs de votre bibliotheque.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Page des recompenses"
              description="L'interface de la boutique de recompenses."
              steps={[
                { label: "Solde de points", desc: "En haut de page, un bandeau violet affiche votre solde actuel de points." },
                { label: "Cartes de recompenses", desc: "Chaque recompense affiche son titre, description et cout en points." },
                { label: "Bouton 'Echanger'", desc: "Cliquez pour utiliser vos points et obtenir la recompense." },
                { label: "Cadenas (verrouille)", desc: "Si vous n'avez pas assez de points, un cadenas s'affiche et le bouton est desactive." }
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-2">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <p className="font-bold text-lg text-green-600">+50 pts</p>
                <p className="text-xs text-slate-500 mt-1">Ressource approuvee</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <p className="font-bold text-lg text-amber-600">+10 pts</p>
                <p className="text-xs text-slate-500 mt-1">Suggestion soumise</p>
              </Card>
              <Card className="p-4 text-center">
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5" />
                </div>
                <p className="font-bold text-lg text-purple-600">Variable</p>
                <p className="text-xs text-slate-500 mt-1">Cout par recompense</p>
              </Card>
            </div>
          </div>
        );

      case 'approvals':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Approbations</h2>
              <Badge variant="outline" className="mb-3">Professeurs, Directeurs, Super Admins</Badge>
              <p className="text-slate-600 leading-relaxed">
                Cette section permet aux professeurs, directeurs et super admins d'examiner 
                les ressources soumises par les etudiants et de les approuver ou rejeter.
              </p>
            </div>

            <ScreenshotPlaceholder
              title="Examiner les soumissions"
              description="Interface d'approbation des ressources en attente."
              steps={[
                { label: "Liste des ressources en attente", desc: "Les ressources soumises par les etudiants apparaissent sous forme de cartes." },
                { label: "Consulter les details", desc: "Chaque carte affiche le titre, l'auteur, le type, la discipline et le lien." },
                { label: "Approuver (bouton vert)", desc: "Validez la ressource. L'etudiant recoit 50 points." },
                { label: "Rejeter (bouton rouge)", desc: "Refusez la ressource si elle ne correspond pas aux criteres." },
                { label: "Message 'Tout est a jour'", desc: "Quand il n'y a plus de soumissions en attente, un message de confirmation s'affiche." }
              ]}
            />

            <div className="p-4 rounded-xl bg-green-50 border border-green-100">
              <p className="text-sm text-green-800">
                <strong>Impact de l'approbation :</strong> Lorsque vous approuvez une ressource, elle devient 
                visible dans le catalogue pour tous les utilisateurs et le soumetteur recoit automatiquement 50 points.
              </p>
            </div>
          </div>
        );

      case 'admin':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Panneau Super Admin</h2>
              <Badge variant="destructive" className="mb-3">Super Admins uniquement</Badge>
              <p className="text-slate-600 leading-relaxed">
                Le panneau Super Admin offre un controle complet sur la plateforme multi-tenant, 
                incluant la gestion des bibliotheques, utilisateurs, ressources et recompenses.
              </p>
            </div>

            <CollapsibleSection title="Vue d'ensemble - Statistiques globales" defaultOpen>
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Statistiques agregees de toutes les bibliotheques de la plateforme.</p>
                <ScreenshotPlaceholder
                  title="Tableau de bord global"
                  description="Vue consolidee de toutes les bibliotheques."
                  steps={[
                    { label: "Statistiques totales", desc: "Total utilisateurs, ressources, recompenses et suggestions a travers toutes les bibliotheques." },
                    { label: "Repartition par bibliotheque", desc: "Tableau detaille montrant les utilisateurs, ressources et suggestions par bibliotheque." },
                    { label: "Graphiques globaux", desc: "Camembert des ressources par type et barres des disciplines les plus representees." },
                    { label: "Export de donnees", desc: "Boutons pour telecharger les donnees par bibliotheque ou toutes les donnees en JSON." }
                  ]}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Gestion des Bibliotheques">
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Creer et gerer les bibliotheques universitaires de la plateforme.</p>
                <ScreenshotPlaceholder
                  title="CRUD Bibliotheques"
                  description="Operations de creation, modification et suppression."
                  steps={[
                    { label: "Ajouter une bibliotheque", desc: "Cliquez 'Ajouter' et remplissez : nom, slug, nom d'universite, email, URL, description." },
                    { label: "Modifier une bibliotheque", desc: "Cliquez l'icone d'edition pour modifier les informations." },
                    { label: "Activer/Desactiver", desc: "Basculez le statut actif/inactif d'une bibliotheque." },
                    { label: "Supprimer", desc: "Supprimez une bibliotheque (la bibliotheque UPC par defaut ne peut pas etre supprimee)." }
                  ]}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Gestion des Utilisateurs">
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Gerer les roles, points et affectations des utilisateurs.</p>
                <ScreenshotPlaceholder
                  title="Administration des utilisateurs"
                  description="Fonctionnalites de gestion des comptes utilisateurs."
                  steps={[
                    { label: "Liste des utilisateurs", desc: "Tableau avec nom, email, role, points et bibliotheque de chaque utilisateur." },
                    { label: "Filtrer par bibliotheque", desc: "Selectionnez une bibliotheque pour voir uniquement ses utilisateurs." },
                    { label: "Changer le role", desc: "Selectionnez un nouveau role : Etudiant, Professeur, Directeur, Super Admin." },
                    { label: "Modifier les points", desc: "Ajustez manuellement le nombre de points d'un utilisateur." },
                    { label: "Changer de bibliotheque", desc: "Deplacez un utilisateur vers une autre bibliotheque." },
                    { label: "Supprimer un utilisateur", desc: "Supprimez un compte utilisateur de la plateforme." }
                  ]}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Gestion des Ressources">
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Superviser toutes les ressources de la plateforme.</p>
                <ScreenshotPlaceholder
                  title="Administration des ressources"
                  description="Vue et gestion de toutes les ressources."
                  steps={[
                    { label: "Liste complete", desc: "Toutes les ressources avec leur statut, type et discipline." },
                    { label: "Approuver/Rejeter", desc: "Changez le statut d'une ressource directement depuis le tableau." },
                    { label: "Supprimer", desc: "Supprimez une ressource de la base de donnees." }
                  ]}
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="Gestion des Recompenses">
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Creer et gerer les recompenses pour les etudiants.</p>
                <ScreenshotPlaceholder
                  title="Administration des recompenses"
                  description="Creation de nouvelles recompenses."
                  steps={[
                    { label: "Liste des recompenses", desc: "Toutes les recompenses avec leur titre, description et cout en points." },
                    { label: "Ajouter une recompense", desc: "Remplissez le titre, la description, le cout en points et l'URL de l'image." },
                    { label: "Gerer les echanges", desc: "Suivez quelles recompenses ont ete echangees par les etudiants." }
                  ]}
                />
              </div>
            </CollapsibleSection>
          </div>
        );

      case 'roles':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Roles et Permissions</h2>
              <p className="text-slate-600 leading-relaxed">
                E-Biblio utilise un systeme de roles hierarchiques pour controler l'acces 
                aux differentes fonctionnalites de la plateforme.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  role: "Etudiant",
                  badge: "bg-blue-50 text-blue-700 border-blue-200",
                  permissions: [
                    "Parcourir le catalogue de ressources approuvees",
                    "Rechercher dans les bases externes (OpenLibrary, DOAJ)",
                    "Soumettre de nouvelles ressources (soumises a approbation)",
                    "Proposer des suggestions de ressources",
                    "Accumuler et echanger des points contre des recompenses",
                    "Consulter le repertoire des sources academiques",
                  ]
                },
                {
                  role: "Professeur",
                  badge: "bg-green-50 text-green-700 border-green-200",
                  permissions: [
                    "Toutes les permissions d'un etudiant",
                    "Approuver ou rejeter les ressources soumises",
                    "Examiner les soumissions dans la section Approbations",
                  ]
                },
                {
                  role: "Directeur",
                  badge: "bg-purple-50 text-purple-700 border-purple-200",
                  permissions: [
                    "Toutes les permissions d'un professeur",
                    "Approuver ou rejeter les suggestions de ressources",
                    "Memes capacites d'approbation que le professeur",
                  ]
                },
                {
                  role: "Super Admin",
                  badge: "bg-red-50 text-red-700 border-red-200",
                  permissions: [
                    "Toutes les permissions precedentes",
                    "Gerer les bibliotheques (creer, modifier, supprimer)",
                    "Gerer les utilisateurs (roles, points, affectations)",
                    "Gerer les ressources (supprimer, modifier le statut)",
                    "Creer et gerer les recompenses",
                    "Voir les statistiques globales multi-tenant",
                    "Exporter les donnees de la plateforme",
                    "Transerer les utilisateurs entre bibliotheques",
                  ]
                },
              ].map((item) => (
                <Card key={item.role} className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={cn("text-xs border", item.badge)}>{item.role}</Badge>
                  </div>
                  <ul className="space-y-2">
                    {item.permissions.map((perm, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {perm}
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'points':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Systeme de Points</h2>
              <p className="text-slate-600 leading-relaxed">
                Le systeme de gamification encourage les etudiants a contribuer activement 
                a la bibliotheque en leur attribuant des points echangeables contre des recompenses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-5 border-green-200 bg-green-50/50">
                <h3 className="font-display font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Comment gagner des points
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <span className="font-bold text-xl text-green-600">+50</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Ressource approuvee</p>
                      <p className="text-xs text-slate-500">Soumettez une ressource qui est validee par un administrateur.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <span className="font-bold text-xl text-green-600">+10</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Suggestion soumise</p>
                      <p className="text-xs text-slate-500">Proposez une nouvelle ressource via le systeme de suggestions.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-5 border-purple-200 bg-purple-50/50">
                <h3 className="font-display font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" /> Comment depenser des points
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <span className="font-bold text-xl text-purple-600">-N</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Echanger une recompense</p>
                      <p className="text-xs text-slate-500">Allez dans la section Recompenses et cliquez sur "Echanger".</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 pl-2">
                    Les recompenses disponibles et leurs couts en points sont definis par les administrateurs 
                    de votre bibliotheque.
                  </p>
                </div>
              </Card>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-800">
                <strong>Astuce :</strong> Concentrez-vous sur la qualite de vos soumissions. 
                Une ressource bien documentee a plus de chances d'etre approuvee rapidement, 
                vous rapportant 50 points au lieu de seulement 10 pour une suggestion.
              </p>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Questions Frequentes</h2>
              <p className="text-slate-600 leading-relaxed">
                Reponses aux questions les plus courantes sur l'utilisation de E-Biblio.
              </p>
            </div>

            <div className="space-y-3">
              <CollapsibleSection title="Comment me connecter a E-Biblio ?" defaultOpen>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Cliquez sur le bouton "Commencer" ou "Connexion" sur la page d'accueil. 
                  Vous serez redirige vers Replit Auth pour vous authentifier avec votre compte Replit. 
                  Apres connexion, vous accedez automatiquement a votre tableau de bord.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Pourquoi ma ressource est-elle 'En attente' ?">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Toutes les ressources soumises passent par un processus d'approbation. Un professeur, 
                  directeur ou super admin doit examiner et valider votre soumission. Cela garantit 
                  la qualite du catalogue. Vous recevrez 50 points une fois approuvee.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Comment gagner plus de points rapidement ?">
                <p className="text-sm text-slate-600 leading-relaxed">
                  La meilleure facon est de soumettre des ressources de qualite (+50 points par approbation). 
                  Vous pouvez aussi proposer des suggestions (+10 points chacune). Fournissez des descriptions 
                  detaillees et des liens fonctionnels pour augmenter vos chances d'approbation.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Quelle est la difference entre 'Soumettre' et 'Suggestion' ?">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>Soumettre une ressource</strong> ajoute directement une ressource complete au catalogue 
                  (en attente d'approbation). Vous fournissez tous les details : titre, auteur, type, etc. 
                  (+50 pts si approuvee)<br/><br/>
                  <strong>Suggestion</strong> est une proposition plus legere. Vous suggerez une ressource que 
                  les administrateurs pourraient ajouter. Moins de details requis. (+10 pts)
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Puis-je modifier une ressource apres soumission ?">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Non, une fois soumise, seuls les administrateurs (professeurs, directeurs, super admins) 
                  peuvent modifier ou supprimer une ressource. Si vous avez fait une erreur, contactez 
                  un administrateur de votre bibliotheque.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Comment fonctionnent les bibliotheques multiples ?">
                <p className="text-sm text-slate-600 leading-relaxed">
                  E-Biblio supporte plusieurs bibliotheques universitaires. Chaque utilisateur est affecte 
                  a une bibliotheque specifique et ne voit que les ressources de sa bibliotheque. 
                  Les super admins peuvent gerer toutes les bibliotheques et deplacer les utilisateurs.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Comment acceder aux sources academiques externes ?">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Allez dans la section "Sources academiques" du menu lateral. Vous y trouverez plus de 40 
                  bases de donnees en libre acces organisees en 9 categories. Cliquez sur "Visiter" pour 
                  acceder directement au site de chaque source.
                </p>
              </CollapsibleSection>

              <CollapsibleSection title="Que faire si j'ai un probleme technique ?">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Contactez un administrateur de votre bibliotheque ou le super admin de la plateforme. 
                  Decrivez le probleme rencontre et les etapes pour le reproduire.
                </p>
              </CollapsibleSection>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Architecture Technique</h2>
              <p className="text-slate-600 leading-relaxed">
                E-Biblio est une application web full-stack multi-tenant construite avec une architecture moderne separant clairement le frontend, le backend et la base de donnees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 border-sky-200 bg-sky-50/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                    <LayoutDashboard className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">Frontend</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li><strong>React 18</strong> + TypeScript</li>
                  <li><strong>Vite</strong> — serveur de developpement & bundler</li>
                  <li><strong>Wouter</strong> — routage cote client</li>
                  <li><strong>TanStack Query v5</strong> — gestion d'etat serveur</li>
                  <li><strong>Shadcn UI</strong> + Radix UI + Tailwind CSS</li>
                  <li><strong>Framer Motion</strong> — animations</li>
                  <li><strong>Lucide React</strong> — icones</li>
                </ul>
              </Card>
              <Card className="p-5 border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">Backend</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li><strong>Node.js</strong> + Express.js</li>
                  <li><strong>tsx</strong> — execution TypeScript natif</li>
                  <li><strong>Drizzle ORM</strong> — ORM type-safe</li>
                  <li><strong>Zod</strong> — validation des donnees</li>
                  <li><strong>Passport.js</strong> — authentification OIDC</li>
                  <li><strong>express-session</strong> — gestion des sessions</li>
                  <li>Frontend + Backend sur le meme port (5000)</li>
                </ul>
              </Card>
              <Card className="p-5 border-violet-200 bg-violet-50/40">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">Infrastructure</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li><strong>PostgreSQL</strong> — base de donnees relationnelle</li>
                  <li><strong>Replit Auth</strong> — authentification OAuth/OIDC</li>
                  <li><strong>Google Cloud Storage</strong> — stockage fichiers</li>
                  <li><strong>Replit Object Storage</strong> — integration stockage</li>
                  <li><strong>Neon DB</strong> — PostgreSQL cloud</li>
                </ul>
              </Card>
            </div>

            <Card className="p-5 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" /> Flux de donnees
              </h3>
              <div className="space-y-3">
                {[
                  { step: "1", label: "Navigateur (React)", desc: "L'utilisateur interagit avec le frontend React. TanStack Query gere les requetes HTTP vers le backend.", color: "bg-sky-100 text-sky-700" },
                  { step: "2", label: "Express API (Node.js)", desc: "Le backend valide les requetes (Zod), verifie l'authentification (Passport), applique les permissions RBAC.", color: "bg-emerald-100 text-emerald-700" },
                  { step: "3", label: "Storage Interface", desc: "La couche storage (IStorage) abstrait toutes les operations CRUD. Les routes restent fines.", color: "bg-amber-100 text-amber-700" },
                  { step: "4", label: "Drizzle ORM + PostgreSQL", desc: "Drizzle traduit les appels TypeScript en SQL type-safe. Les schemas sont partages entre frontend et backend.", color: "bg-violet-100 text-violet-700" },
                ].map(({ step, label, desc, color }) => (
                  <div key={step} className="flex items-start gap-3">
                    <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5", color)}>{step}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-500" /> Structure des fichiers cles
              </h3>
              <div className="space-y-2 font-mono text-xs text-slate-600">
                {[
                  { path: "shared/schema.ts", desc: "Tables Drizzle + schemas Zod partages" },
                  { path: "shared/routes.ts", desc: "Contrat API type-safe (routes + schemas)" },
                  { path: "shared/models/auth.ts", desc: "Tables users, libraries, sessions" },
                  { path: "server/index.ts", desc: "Point d'entree Express + Vite SSR" },
                  { path: "server/routes.ts", desc: "Tous les endpoints API REST" },
                  { path: "server/storage.ts", desc: "Interface IStorage + implementation DB" },
                  { path: "server/db.ts", desc: "Connexion Drizzle + PostgreSQL" },
                  { path: "client/src/App.tsx", desc: "Routeur React + ProtectedRoute" },
                  { path: "client/src/pages/", desc: "Toutes les pages de l'application" },
                  { path: "client/src/hooks/", desc: "Hooks React reutilisables (useAuth, etc.)" },
                ].map(({ path, desc }) => (
                  <div key={path} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                    <code className="text-sky-700 shrink-0">{path}</code>
                    <span className="text-slate-500">— {desc}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'datamodel':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Modele de Donnees</h2>
              <p className="text-slate-600 leading-relaxed">
                La base de donnees PostgreSQL est structuree avec 7 tables principales gerees via Drizzle ORM.
                Les schemas sont definis dans <code className="bg-slate-100 px-1 rounded text-sm">shared/schema.ts</code> et 
                <code className="bg-slate-100 px-1 rounded text-sm ml-1">shared/models/auth.ts</code>.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  table: "libraries",
                  color: "border-blue-300 bg-blue-50/30",
                  badge: "bg-blue-100 text-blue-700",
                  desc: "Bibliotheques universitaires (multi-tenant). Chaque bibliotheque a son propre abonnement, couleurs et donnees isolees.",
                  fields: [
                    { name: "id", type: "serial PK" },
                    { name: "name", type: "text NOT NULL" },
                    { name: "slug", type: "text UNIQUE" },
                    { name: "universityName", type: "text NOT NULL" },
                    { name: "subscriptionTier", type: "text (free|standard|premium)" },
                    { name: "primaryColor, secondaryColor", type: "text" },
                    { name: "storageLimitTb, storageUsedBytes", type: "integer, text" },
                    { name: "isActive", type: "integer (0|1)" },
                  ]
                },
                {
                  table: "users",
                  color: "border-green-300 bg-green-50/30",
                  badge: "bg-green-100 text-green-700",
                  desc: "Comptes utilisateurs. L'ID est un varchar UUID genere par Replit Auth ou manuellement. Chaque utilisateur appartient a une bibliotheque.",
                  fields: [
                    { name: "id", type: "varchar PK (UUID)" },
                    { name: "email", type: "varchar UNIQUE" },
                    { name: "firstName, lastName", type: "varchar" },
                    { name: "role", type: "text (student|professor|director|admin|super_admin)" },
                    { name: "points", type: "integer DEFAULT 0" },
                    { name: "libraryId", type: "integer FK → libraries.id" },
                    { name: "discipline, bio, phone, address", type: "text" },
                    { name: "badgeLevel", type: "text (newcomer...)" },
                  ]
                },
                {
                  table: "resources",
                  color: "border-amber-300 bg-amber-50/30",
                  badge: "bg-amber-100 text-amber-700",
                  desc: "Ressources academiques soumises et approuvees. Un statut (pending/approved/rejected) gere le flux d'approbation.",
                  fields: [
                    { name: "id", type: "serial PK" },
                    { name: "title", type: "text NOT NULL" },
                    { name: "type", type: "text (book|article|journal|thesis|...)" },
                    { name: "source", type: "text (internal|openlibrary|doaj|...)" },
                    { name: "discipline, language", type: "text" },
                    { name: "status", type: "text (pending|approved|rejected)" },
                    { name: "author, publisher, isbn", type: "text" },
                    { name: "url, downloadUrl, description", type: "text" },
                    { name: "submittedBy", type: "varchar FK → users.id" },
                    { name: "libraryId", type: "integer FK → libraries.id" },
                  ]
                },
                {
                  table: "suggestions",
                  color: "border-orange-300 bg-orange-50/30",
                  badge: "bg-orange-100 text-orange-700",
                  desc: "Suggestions de ressources proposees par les utilisateurs. Plus legeres que les ressources completes.",
                  fields: [
                    { name: "id", type: "serial PK" },
                    { name: "title", type: "text NOT NULL" },
                    { name: "url, description", type: "text" },
                    { name: "type, discipline", type: "text" },
                    { name: "status", type: "text (pending|approved|rejected)" },
                    { name: "adminNote", type: "text" },
                    { name: "submittedBy", type: "varchar FK → users.id" },
                    { name: "libraryId", type: "integer FK → libraries.id" },
                  ]
                },
                {
                  table: "rewards",
                  color: "border-purple-300 bg-purple-50/30",
                  badge: "bg-purple-100 text-purple-700",
                  desc: "Recompenses creees par les admins. Les etudiants les echangent contre leurs points via la table user_rewards.",
                  fields: [
                    { name: "id", type: "serial PK" },
                    { name: "title, description", type: "text NOT NULL" },
                    { name: "pointsRequired", type: "integer NOT NULL" },
                    { name: "imageUrl", type: "text" },
                    { name: "libraryId", type: "integer FK → libraries.id" },
                  ]
                },
                {
                  table: "user_rewards",
                  color: "border-pink-300 bg-pink-50/30",
                  badge: "bg-pink-100 text-pink-700",
                  desc: "Table de jonction enregistrant les echanges de recompenses. La deduction de points se fait en transaction atomique.",
                  fields: [
                    { name: "id", type: "serial PK" },
                    { name: "userId", type: "varchar FK → users.id NOT NULL" },
                    { name: "rewardId", type: "integer FK → rewards.id NOT NULL" },
                    { name: "redeemedAt", type: "timestamp DEFAULT NOW()" },
                  ]
                },
                {
                  table: "media",
                  color: "border-teal-300 bg-teal-50/30",
                  badge: "bg-teal-100 text-teal-700",
                  desc: "Fichiers uploades (PDFs, images) stockes dans Google Cloud Storage. Les metadonnees sont en base, les fichiers dans l'object storage.",
                  fields: [
                    { name: "id", type: "serial PK" },
                    { name: "fileName, originalName", type: "text NOT NULL" },
                    { name: "mimeType", type: "text NOT NULL" },
                    { name: "size", type: "integer NOT NULL (bytes)" },
                    { name: "objectPath", type: "text NOT NULL (chemin GCS)" },
                    { name: "url", type: "text (URL publique)" },
                    { name: "resourceId", type: "integer FK → resources.id" },
                    { name: "uploadedBy", type: "varchar FK → users.id" },
                    { name: "libraryId", type: "integer FK → libraries.id" },
                  ]
                },
              ].map(({ table, color, badge, desc, fields }) => (
                <Card key={table} className={cn("p-5 border", color)}>
                  <div className="flex items-center gap-2 mb-2">
                    <code className={cn("text-xs font-bold px-2 py-0.5 rounded", badge)}>{table}</code>
                  </div>
                  <p className="text-xs text-slate-600 mb-3 leading-relaxed">{desc}</p>
                  <div className="space-y-1">
                    {fields.map(({ name, type }) => (
                      <div key={name} className="flex items-start gap-2 text-xs">
                        <code className="text-slate-800 font-semibold shrink-0 w-48">{name}</code>
                        <span className="text-slate-500">{type}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'apiref':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Reference API REST</h2>
              <p className="text-slate-600 leading-relaxed">
                Tous les endpoints sont definis dans <code className="bg-slate-100 px-1 rounded text-sm">server/routes.ts</code> 
                et leur contrat (input/output Zod) dans <code className="bg-slate-100 px-1 rounded text-sm ml-1">shared/routes.ts</code>.
                L'URL de base est <code className="bg-slate-100 px-1 rounded text-sm ml-1">/api</code>.
              </p>
            </div>

            {[
              {
                group: "Authentification",
                color: "bg-slate-100 text-slate-700",
                endpoints: [
                  { method: "GET", path: "/api/auth/user", auth: "Public", desc: "Retourne l'utilisateur courant (null si non connecte)" },
                  { method: "GET", path: "/api/login", auth: "Public", desc: "Redirige vers Replit OIDC pour connexion" },
                  { method: "GET", path: "/api/logout", auth: "Auth", desc: "Deconnecte l'utilisateur et detruit la session" },
                  { method: "GET", path: "/api/callback", auth: "Public", desc: "Callback OAuth apres connexion Replit" },
                ]
              },
              {
                group: "Ressources",
                color: "bg-blue-100 text-blue-700",
                endpoints: [
                  { method: "GET", path: "/api/resources", auth: "Public", desc: "Liste les ressources (filtres: status, type, source, discipline, search)" },
                  { method: "GET", path: "/api/resources/:id", auth: "Public", desc: "Retourne une ressource par ID" },
                  { method: "POST", path: "/api/resources", auth: "Auth", desc: "Soumet une nouvelle ressource (statut: pending)" },
                  { method: "PATCH", path: "/api/resources/:id", auth: "Admin", desc: "Met a jour une ressource (statut, details). +50pts si approuvee." },
                  { method: "DELETE", path: "/api/resources/:id", auth: "Admin", desc: "Supprime une ressource et ses medias associes" },
                ]
              },
              {
                group: "Recherche Externe",
                color: "bg-violet-100 text-violet-700",
                endpoints: [
                  { method: "GET", path: "/api/external/search", auth: "Standard+", desc: "Recherche dans OpenLibrary et/ou DOAJ. Params: q, source, author, yearFrom, yearTo, language, sort, page, limit" },
                ]
              },
              {
                group: "Suggestions",
                color: "bg-amber-100 text-amber-700",
                endpoints: [
                  { method: "GET", path: "/api/suggestions", auth: "Admin", desc: "Liste toutes les suggestions (filtres: status)" },
                  { method: "GET", path: "/api/suggestions/mine", auth: "Auth", desc: "Liste les suggestions de l'utilisateur courant" },
                  { method: "POST", path: "/api/suggestions", auth: "Auth", desc: "Cree une suggestion (+10 pts automatiquement)" },
                  { method: "PATCH", path: "/api/suggestions/:id", auth: "Admin", desc: "Approuve/rejette une suggestion avec note optionnelle" },
                ]
              },
              {
                group: "Recompenses",
                color: "bg-purple-100 text-purple-700",
                endpoints: [
                  { method: "GET", path: "/api/rewards", auth: "Public", desc: "Liste les recompenses de la bibliotheque courante" },
                  { method: "POST", path: "/api/rewards", auth: "Admin", desc: "Cree une nouvelle recompense" },
                  { method: "POST", path: "/api/rewards/:id/redeem", auth: "Auth", desc: "Echange une recompense (transaction atomique: deduction points)" },
                ]
              },
              {
                group: "Utilisateurs & Profils",
                color: "bg-green-100 text-green-700",
                endpoints: [
                  { method: "GET", path: "/api/users/:id", auth: "Auth", desc: "Retourne le profil d'un utilisateur (soi-meme ou admin)" },
                  { method: "PATCH", path: "/api/users/:id/profile", auth: "Auth", desc: "Modifie le profil (nom, bio, phone, discipline, avatar)" },
                  { method: "GET", path: "/api/admin/users", auth: "Admin", desc: "Liste tous les utilisateurs de la bibliotheque" },
                  { method: "POST", path: "/api/admin/users", auth: "LibAdmin", desc: "Cree un utilisateur manuellement" },
                  { method: "PATCH", path: "/api/admin/users/:id/role", auth: "SuperAdmin", desc: "Change le role d'un utilisateur" },
                  { method: "PATCH", path: "/api/admin/users/:id/points", auth: "Admin", desc: "Modifie manuellement les points d'un utilisateur" },
                  { method: "DELETE", path: "/api/admin/users/:id", auth: "LibAdmin", desc: "Supprime un utilisateur" },
                ]
              },
              {
                group: "Bibliotheques (Super Admin)",
                color: "bg-red-100 text-red-700",
                endpoints: [
                  { method: "GET", path: "/api/admin/libraries", auth: "SuperAdmin", desc: "Liste toutes les bibliotheques" },
                  { method: "POST", path: "/api/admin/libraries", auth: "SuperAdmin", desc: "Cree une nouvelle bibliotheque" },
                  { method: "PATCH", path: "/api/admin/libraries/:id", auth: "SuperAdmin", desc: "Modifie une bibliotheque" },
                  { method: "DELETE", path: "/api/admin/libraries/:id", auth: "SuperAdmin", desc: "Supprime une bibliotheque et toutes ses donnees" },
                  { method: "PATCH", path: "/api/admin/libraries/:id/subscription", auth: "SuperAdmin", desc: "Change le niveau d'abonnement et le stockage" },
                  { method: "GET", path: "/api/admin/stats", auth: "Admin", desc: "Statistiques de la bibliotheque courante" },
                  { method: "GET", path: "/api/admin/global-stats", auth: "SuperAdmin", desc: "Statistiques globales de toute la plateforme" },
                  { method: "GET", path: "/api/admin/export/library/:id", auth: "SuperAdmin", desc: "Export JSON d'une bibliotheque" },
                  { method: "GET", path: "/api/admin/export/all", auth: "SuperAdmin", desc: "Export JSON de toute la plateforme" },
                ]
              },
            ].map(({ group, color, endpoints }) => (
              <CollapsibleSection key={group} title={group} defaultOpen={group === "Ressources"}>
                <div className="space-y-2 mt-1">
                  {endpoints.map(({ method, path, auth, desc }) => (
                    <div key={path} className="flex flex-wrap items-start gap-2 p-2.5 bg-slate-50 rounded-lg">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0", 
                        method === 'GET' ? 'bg-blue-100 text-blue-700' :
                        method === 'POST' ? 'bg-green-100 text-green-700' :
                        method === 'PATCH' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      )}>{method}</span>
                      <code className="text-xs text-slate-800 font-mono shrink-0">{path}</code>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded shrink-0", color)}>{auth}</span>
                      <span className="text-xs text-slate-500 leading-relaxed">{desc}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            ))}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Securite & Abonnements</h2>
              <p className="text-slate-600 leading-relaxed">
                E-Biblio implemente plusieurs couches de securite : authentification, controle d'acces par role (RBAC), 
                isolation multi-tenant, et fonctionnalites gatees par niveau d'abonnement.
              </p>
            </div>

            <Card className="p-5 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> Authentification & Sessions
              </h3>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Replit Auth (OIDC)</strong>
                    <p className="text-xs mt-0.5">Authentification deleguee a Replit via OpenID Connect. Aucun mot de passe stocke en base. Les tokens sont verifies via Passport.js.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Sessions PostgreSQL</strong>
                    <p className="text-xs mt-0.5">Les sessions sont stockees dans la table <code>sessions</code> (PostgreSQL). Securisees avec un secret d'environnement, HTTPOnly et SameSite.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-800">Middleware d'autorisation</strong>
                    <p className="text-xs mt-0.5">Chaque route protegee utilise un middleware : <code>requireAuth</code>, <code>requireAdminRole</code>, <code>requireLibraryAdmin</code>, ou <code>requireSuperAdmin</code>.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" /> Hierarchie des roles (RBAC)
              </h3>
              <div className="space-y-2">
                {[
                  { role: "super_admin", level: 4, perms: "Acces complet a toute la plateforme", color: "bg-red-100 text-red-700" },
                  { role: "admin", level: 3, perms: "Gestion complete d'une bibliotheque", color: "bg-orange-100 text-orange-700" },
                  { role: "director", level: 2, perms: "Approbation ressources + toutes perms professeur", color: "bg-purple-100 text-purple-700" },
                  { role: "professor", level: 1, perms: "Approbation et rejet de ressources", color: "bg-green-100 text-green-700" },
                  { role: "student", level: 0, perms: "Consultation, soumission, suggestions, recompenses", color: "bg-blue-100 text-blue-700" },
                ].map(({ role, level, perms, color }) => (
                  <div key={role} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-lg">
                    <Badge className={cn("text-xs shrink-0", color)}>{role}</Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className={cn("w-2 h-2 rounded-full", i <= level ? "bg-primary" : "bg-slate-200")} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-600">{perms}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" /> Niveaux d'abonnement
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-slate-600 font-semibold">Fonctionnalite</th>
                      <th className="text-center py-2 px-3 text-slate-500">Gratuit</th>
                      <th className="text-center py-2 px-3 text-slate-500">Standard</th>
                      <th className="text-center py-2 px-3 text-slate-500">Premium</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      ["Consulter le catalogue", "✓", "✓", "✓"],
                      ["Sources academiques", "✓", "✓", "✓"],
                      ["Recherche externe (OpenLibrary/DOAJ)", "✗", "✓", "✓"],
                      ["Creer des comptes Professeur/Directeur", "✗", "✓", "✓"],
                      ["Approuver des ressources", "✗", "✓", "✓"],
                      ["Soumission par les etudiants", "✗", "✗", "✓"],
                      ["Gestion des recompenses", "✗", "✗", "✓"],
                      ["Gestion des suggestions", "✗", "✗", "✓"],
                      ["Stockage fichiers", "1 To", "3 To", "6 To"],
                      ["Support premium", "✗", "✗", "✓"],
                    ].map(([feat, free, std, prem]) => (
                      <tr key={feat}>
                        <td className="py-2 pr-4 text-slate-700">{feat}</td>
                        <td className={cn("text-center py-2 px-3", free === "✗" ? "text-red-400" : "text-green-600")}>{free}</td>
                        <td className={cn("text-center py-2 px-3", std === "✗" ? "text-red-400" : "text-green-600")}>{std}</td>
                        <td className={cn("text-center py-2 px-3", prem === "✗" ? "text-red-400" : "text-green-600")}>{prem}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-500">
                <span>Gratuit: <strong>0 €/mois</strong></span>
                <span>Standard: <strong>39,99 €/mois</strong></span>
                <span>Premium: <strong>69,99 €/mois</strong></span>
              </div>
            </Card>

            <Card className="p-5 border-slate-200">
              <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600" /> Isolation Multi-Tenant
              </h3>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="text-xs leading-relaxed">Toutes les tables de donnees (resources, suggestions, rewards, users, media) incluent un champ <code className="bg-slate-100 px-1 rounded">library_id</code> qui assure l'isolation des donnees entre bibliotheques. Les requetes API filtrent automatiquement par la bibliotheque de l'utilisateur connecte, sauf pour les Super Admins qui ont acces a toutes les donnees.</p>
                <div className="flex items-start gap-2 p-3 bg-teal-50 rounded-lg mt-2">
                  <ArrowRight className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                  <p className="text-xs"><strong>Garantie d'isolation :</strong> Un utilisateur d'une bibliotheque A ne peut jamais voir, modifier ou acceder aux donnees d'une bibliotheque B, meme par manipulation d'URL.</p>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="mb-6 md:mb-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
            <BookOpen className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight" data-testid="text-documentation-title">
              Documentation E-Biblio
            </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500">
            Guide complet de toutes les fonctionnalites de la plateforme.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="lg:w-64 shrink-0">
            <div className="lg:sticky lg:top-4 space-y-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 pt-1 pb-2">Sections</p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                  data-testid={`button-doc-${section.id}`}
                >
                  <section.icon className={cn("w-4 h-4", activeSection === section.id ? "text-primary" : section.color)} />
                  <span className="truncate">{section.title}</span>
                </button>
              ))}
            </div>
          </nav>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
