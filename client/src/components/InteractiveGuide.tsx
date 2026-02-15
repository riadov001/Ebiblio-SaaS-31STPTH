import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, HelpCircle, LayoutDashboard, Library, Upload, Search, Globe, Lightbulb, Award, CheckSquare, Shield, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GuideStep {
  title: string;
  description: string;
  icon: any;
  details: string[];
  tip?: string;
  path?: string;
}

const guideSteps: GuideStep[] = [
  {
    title: "Tableau de bord",
    description: "Votre page d'accueil personnalisée avec un apercu complet de votre activite.",
    icon: LayoutDashboard,
    details: [
      "Consultez vos statistiques en un coup d'oeil : nombre de ressources, ressources approuvees, en attente et vos points accumules.",
      "Des graphiques interactifs montrent la repartition des ressources par type (livres, articles, revues...) et par discipline.",
      "Les actions rapides vous permettent de naviguer directement vers les fonctionnalites principales.",
      "La section 'Ajouts Recents' affiche les dernieres ressources ajoutees a la bibliotheque."
    ],
    tip: "Consultez regulierement votre tableau de bord pour suivre vos points et voir les nouvelles ressources.",
    path: "/dashboard"
  },
  {
    title: "Catalogue de la Bibliotheque",
    description: "Parcourez toutes les ressources approuvees dans la bibliotheque.",
    icon: Library,
    details: [
      "Utilisez la barre de recherche pour trouver des ressources par titre ou auteur.",
      "Filtrez par type : Livres, Articles, Revues, Theses, Bases de donnees, Archives, Manuels.",
      "Filtrez par discipline : 17 disciplines academiques disponibles (Droit, Medecine, Theologie, Informatique, etc.).",
      "Chaque carte de ressource affiche le titre, l'auteur, le type, la discipline et le statut."
    ],
    tip: "Combinez les filtres de type et de discipline pour affiner votre recherche.",
    path: "/resources"
  },
  {
    title: "Soumettre une Ressource",
    description: "Contribuez a la bibliotheque en ajoutant de nouvelles ressources academiques.",
    icon: Upload,
    details: [
      "Remplissez le formulaire avec les informations de la ressource : titre, auteur, type, discipline, etc.",
      "Choisissez la source (Interne, OpenLibrary, DOAJ) et la langue de la ressource.",
      "Ajoutez l'URL, l'ISBN et l'annee de publication si disponibles.",
      "Votre soumission sera examinee par un professeur ou directeur.",
      "Gagnez 50 points pour chaque ressource approuvee !"
    ],
    tip: "Plus votre description est detaillee, plus vite votre ressource sera approuvee.",
    path: "/submit"
  },
  {
    title: "Recherche Externe",
    description: "Recherchez dans les bases de donnees mondiales OpenLibrary et DOAJ.",
    icon: Search,
    details: [
      "Entrez un titre, un auteur ou un ISBN dans la barre de recherche.",
      "Filtrez par source : Toutes, OpenLibrary (livres), ou DOAJ (articles academiques).",
      "Filtrez par type : Tout, Livres ou Articles.",
      "Cliquez sur le bouton '+' pour enregistrer une ressource trouvee dans la bibliotheque.",
      "Utilisez le lien externe pour consulter la ressource sur son site d'origine."
    ],
    tip: "OpenLibrary est ideal pour les livres, DOAJ pour les articles scientifiques en libre acces.",
    path: "/search"
  },
  {
    title: "Sources Academiques",
    description: "Repertoire de plus de 40 bases de donnees academiques en libre acces.",
    icon: Globe,
    details: [
      "9 categories de sources : Moteurs de recherche, Preprints, Revues Open Access, Bases regionales, Bibliotheques, Theses, Outils d'acces, Reseaux academiques, Specialises.",
      "Chaque source affiche son nom, une description en francais et un lien direct.",
      "Utilisez la barre de recherche pour trouver rapidement une source specifique.",
      "Inclut des sources africaines comme AJOL (African Journals Online).",
      "Des outils comme Unpaywall et PaperPanda pour acceder aux articles payes."
    ],
    tip: "Explorez Research4Life pour un acces gratuit aux publications depuis les pays en developpement.",
    path: "/sources"
  },
  {
    title: "Suggestions",
    description: "Proposez de nouvelles ressources a ajouter a la bibliotheque.",
    icon: Lightbulb,
    details: [
      "Cliquez sur 'Nouvelle suggestion' pour proposer une ressource.",
      "Renseignez le titre, l'URL, le type, la discipline et une description.",
      "Suivez le statut de vos suggestions : En attente, Approuvee, ou Rejetee.",
      "Les administrateurs peuvent laisser des notes sur vos suggestions.",
      "Gagnez 10 points pour chaque suggestion soumise !"
    ],
    tip: "Ajoutez une URL directe vers la ressource pour faciliter la verification par les administrateurs.",
    path: "/suggestions"
  },
  {
    title: "Recompenses",
    description: "Echangez vos points accumules contre des avantages exclusifs.",
    icon: Award,
    details: [
      "Votre solde de points est affiche en haut de la page.",
      "Parcourez les recompenses disponibles avec leur cout en points.",
      "Cliquez sur 'Echanger' pour utiliser vos points (si vous en avez assez).",
      "Les recompenses verrouillees (cadenas) necessitent plus de points.",
      "Comment gagner des points : +50 pts par ressource approuvee, +10 pts par suggestion."
    ],
    tip: "Soumettez regulierement des ressources de qualite pour accumuler rapidement des points.",
    path: "/rewards"
  },
  {
    title: "Approbations (Professeurs / Directeurs)",
    description: "Examinez et approuvez les soumissions des etudiants.",
    icon: CheckSquare,
    details: [
      "Cette section est reservee aux professeurs, directeurs et super admins.",
      "Les ressources en attente sont affichees sous forme de cartes.",
      "Cliquez sur 'Approuver' pour valider une soumission (l'etudiant gagne 50 pts).",
      "Cliquez sur 'Rejeter' pour refuser une soumission non conforme.",
      "Quand tout est approuve, un message 'Tout est a jour !' s'affiche."
    ],
    tip: "Verifiez les liens et les informations avant d'approuver une ressource.",
    path: "/approvals"
  },
  {
    title: "Super Admin",
    description: "Panneau de gestion multi-tenant complet pour la plateforme.",
    icon: Shield,
    details: [
      "Vue d'ensemble : Statistiques globales avec repartition par bibliotheque, graphiques interactifs.",
      "Bibliotheques : Creer, modifier, supprimer et activer/desactiver des bibliotheques universitaires.",
      "Utilisateurs : Gerer les roles (etudiant, professeur, directeur), ajuster les points, changer la bibliotheque d'un utilisateur.",
      "Ressources : Voir toutes les ressources, approuver/rejeter, supprimer.",
      "Recompenses : Creer de nouvelles recompenses pour les etudiants.",
      "Export de donnees : Telecharger les donnees par bibliotheque ou toutes les donnees en JSON."
    ],
    tip: "Utilisez l'export de donnees regulierement pour sauvegarder vos informations.",
    path: "/admin"
  }
];

interface InteractiveGuideProps {
  onClose: () => void;
  isOpen: boolean;
}

export function InteractiveGuide({ onClose, isOpen }: InteractiveGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = guideSteps[currentStep];

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / guideSteps.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <Card className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-slate-900 text-sm">Guide Interactif E-Biblio</h2>
              <p className="text-xs text-slate-500">Etape {currentStep + 1} sur {guideSteps.length}</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-guide">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-1.5 bg-slate-100">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out rounded-r-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <step.icon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-slate-900" data-testid="text-guide-step-title">{step.title}</h3>
              <p className="text-sm text-slate-500 mt-0.5" data-testid="text-guide-step-description">{step.description}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {step.details.map((detail, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  {idx + 1}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>

          {step.tip && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Astuce</p>
                <p className="text-sm text-amber-800">{step.tip}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex gap-1">
            {guideSteps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  idx === currentStep ? "bg-primary w-6" : "bg-slate-200 hover:bg-slate-300"
                )}
                data-testid={`button-guide-step-${idx}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              data-testid="button-guide-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Precedent
            </Button>
            {currentStep < guideSteps.length - 1 ? (
              <Button
                size="sm"
                onClick={() => setCurrentStep(currentStep + 1)}
                data-testid="button-guide-next"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={onClose}
                data-testid="button-guide-finish"
              >
                Terminer
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function GuideButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 z-[100] w-14 h-14 rounded-full shadow-xl shadow-primary/30"
      title="Ouvrir le guide interactif"
      data-testid="button-open-guide"
    >
      <HelpCircle className="w-6 h-6" />
    </Button>
  );
}
