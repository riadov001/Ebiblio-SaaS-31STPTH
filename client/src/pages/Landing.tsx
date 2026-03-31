import { useState } from "react";
import { BookOpen, Search, GraduationCap, ArrowRight, Globe, Award, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import upcLogoPath from "@assets/logo_upc_noire.png";

export default function Landing() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { login, isLoggingIn, loginError, register, isRegistering, registerError } = useAuth();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ firstName: "", lastName: "", email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm);
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Erreur de connexion", description: err.message, variant: "destructive" });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(registerForm);
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: "Erreur d'inscription", description: err.message, variant: "destructive" });
    }
  };

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
              <button
                onClick={() => setTab("login")}
                className="hidden sm:block text-slate-600 hover:text-primary font-medium text-sm px-4 py-2 transition-colors"
                data-testid="button-login-nav"
              >
                Connexion
              </button>
              <button
                onClick={() => setTab("register")}
                className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                data-testid="button-start-nav"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative pt-20 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="mb-6 flex justify-center lg:justify-start"
              >
                <img src={upcLogoPath} alt="UPC" className="w-16 h-16 rounded-2xl shadow-lg shadow-primary/10 object-contain bg-white p-1.5" />
              </motion.div>

              <h1 className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight mb-5">
                Votre portail vers le{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#1a4a8f]">
                  Savoir Académique
                </span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">
                Accédez à des milliers de livres, articles et ressources académiques en libre accès.
                Conçu pour les étudiants et chercheurs de l'UPC.
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  { icon: Globe, color: "text-blue-600 bg-blue-50", label: "40+ Sources" },
                  { icon: Search, color: "text-indigo-600 bg-indigo-50", label: "Recherche avancée" },
                  { icon: Award, color: "text-purple-600 bg-purple-50", label: "Système de points" },
                  { icon: GraduationCap, color: "text-teal-600 bg-teal-50", label: "17 Disciplines" },
                ].map(({ icon: Icon, color, label }) => (
                  <div key={label} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full lg:w-auto lg:min-w-[400px]"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8">
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-slate-900">
                    {tab === "login" ? "Connexion" : "Créer un compte"}
                  </span>
                </div>

                <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
                  <button
                    onClick={() => setTab("login")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "login" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    data-testid="button-tab-login"
                  >
                    Connexion
                  </button>
                  <button
                    onClick={() => setTab("register")}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === "register" ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    data-testid="button-tab-register"
                  >
                    Inscription
                  </button>
                </div>

                {tab === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Adresse email</label>
                      <input
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="votre@email.com"
                        data-testid="input-login-email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Mot de passe</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          placeholder="••••••••"
                          data-testid="input-login-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {loginError && (
                      <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg" data-testid="text-login-error">
                        {loginError.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:translate-y-0"
                      data-testid="button-submit-login"
                    >
                      {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {isLoggingIn ? "Connexion..." : "Se connecter"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Prénom</label>
                        <input
                          type="text"
                          required
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          placeholder="Jean"
                          data-testid="input-register-firstname"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">Nom</label>
                        <input
                          type="text"
                          required
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          placeholder="Dupont"
                          data-testid="input-register-lastname"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Adresse email</label>
                      <input
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                        placeholder="votre@email.com"
                        data-testid="input-register-email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1.5">Mot de passe <span className="text-slate-400">(min. 6 caractères)</span></label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                          placeholder="••••••••"
                          data-testid="input-register-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          data-testid="button-toggle-password-register"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {registerError && (
                      <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg" data-testid="text-register-error">
                        {registerError.message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:translate-y-0"
                      data-testid="button-submit-register"
                    >
                      {isRegistering ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {isRegistering ? "Création..." : "Créer mon compte"}
                    </button>

                    <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                      En créant un compte, vous rejoignez la bibliothèque universitaire E-Biblio UPC.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <footer className="bg-[#052c65] text-white/70 py-10">
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
