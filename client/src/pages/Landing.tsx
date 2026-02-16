import { BookOpen, Search, GraduationCap, ArrowRight, Globe, Users, Award, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import upcLogoPath from "@assets/logo_upc_noire.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img src={upcLogoPath} alt="UPC Logo" className="h-10 w-10 rounded-lg object-contain shadow-sm" />
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-slate-900 leading-tight">E-Biblio</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-[0.2em] -mt-0.5">Université Protestante au Congo</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a href="/api/login" className="hidden sm:block">
                <button className="text-slate-600 hover:text-primary font-medium text-sm px-4 py-2 transition-colors" data-testid="button-login">
                  Connexion
                </button>
              </a>
              <a href="/api/login">
                <button className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300" data-testid="button-start">
                  Commencer
                </button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative pt-28 pb-16 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <img src={upcLogoPath} alt="UPC" className="w-20 h-20 mx-auto rounded-2xl shadow-lg shadow-primary/10 object-contain bg-white p-1.5" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight mb-6"
            >
              Votre portail vers le{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#1a4a8f]">
                Savoir Academique
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed px-4"
            >
              Accédez à des milliers de livres, articles et ressources académiques en libre accès.
              Conçu pour les étudiants et chercheurs de l'UPC.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col sm:flex-row justify-center gap-4 px-4"
            >
              <a href="/api/login">
                <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" data-testid="button-explore">
                  Explorer la Bibliothèque <ArrowRight className="w-5 h-5" />
                </button>
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-3">Tout pour votre recherche</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Une plateforme complète pour accéder, partager et contribuer aux ressources académiques.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, color: "bg-blue-50 text-blue-600", title: "40+ Sources Externes", desc: "OpenLibrary, DOAJ, CORE, arXiv, HAL, PubMed, et bien d'autres bases en libre accès." },
              { icon: Search, color: "bg-indigo-50 text-indigo-600", title: "Recherche Avancée", desc: "Recherchez par type, discipline, auteur ou mot-clé dans notre catalogue et les bases externes." },
              { icon: Award, color: "bg-purple-50 text-purple-600", title: "Système de Points", desc: "Gagnez des points en soumettant des ressources et échangez-les contre des récompenses." },
              { icon: GraduationCap, color: "bg-teal-50 text-teal-600", title: "17 Disciplines", desc: "Droit, Médecine, Théologie, Informatique, Sciences Économiques et plus encore." },
            ].map((feature) => (
              <div key={feature.title} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-5`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-slate-900">{feature.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 mb-3">Comment ça marche ?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Connectez-vous", desc: "Utilisez votre compte Replit pour accéder à la plateforme." },
              { step: "2", title: "Explorez & Contribuez", desc: "Parcourez le catalogue, recherchez des sources externes, soumettez vos trouvailles." },
              { step: "3", title: "Gagnez des récompenses", desc: "Chaque contribution approuvée vous rapporte des points échangeables." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary text-white font-display font-bold text-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/20">
                  {item.step}
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-slate-900">{item.title}</h3>
                <p className="text-slate-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-[#052c65] text-white/70 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={upcLogoPath} alt="UPC" className="w-10 h-10 rounded-lg object-contain bg-white/10 p-1" />
              <div>
                <span className="font-display font-bold text-white text-lg block leading-tight">E-Biblio UPC</span>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">Bibliothèque Numérique</span>
              </div>
            </div>
            <div className="text-sm text-center md:text-right">
              <p>Université Protestante au Congo</p>
              <p className="text-white/40 text-xs mt-1">© {new Date().getFullYear()} E-Biblio UPC. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
