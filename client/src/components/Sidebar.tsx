import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Library, 
  LayoutDashboard, 
  Search, 
  Award, 
  CheckSquare, 
  LogOut, 
  BookOpen,
  Shield,
  Menu,
  X,
  Globe,
  Lightbulb,
  Upload,
  HelpCircle,
  Settings,
  UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_LABELS } from "@shared/schema";
import upcLogoPath from "@assets/logo_upc_noire.png";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const userRole = (user as any)?.role || 'student';

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/profile", label: "Mon Profil", icon: UserCircle },
    { href: "/resources", label: "Catalogue", icon: Library },
    { href: "/submit", label: "Soumettre", icon: Upload },
    { href: "/search", label: "Recherche externe", icon: Search },
    { href: "/sources", label: "Sources académiques", icon: Globe },
    { href: "/suggestions", label: "Suggestions", icon: Lightbulb },
    { href: "/rewards", label: "Récompenses", icon: Award },
    { href: "/documentation", label: "Guide & Aide", icon: HelpCircle },
  ];

  if (userRole === 'director' || userRole === 'professor' || userRole === 'admin' || userRole === 'super_admin') {
    navItems.push({ href: "/approvals", label: "Approbations", icon: CheckSquare });
  }

  if (userRole === 'admin' || userRole === 'super_admin') {
    navItems.push({ href: "/library-admin", label: "Gestion", icon: Settings });
  }

  if (userRole === 'super_admin') {
    navItems.push({ href: "/admin", label: "Super Admin", icon: Shield });
  }

  const sidebarContent = (
    <>
      <div className="p-5 pb-3">
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-md overflow-hidden p-1.5" data-testid="img-sidebar-logo">
            <img 
              src={upcLogoPath} 
              alt="UPC Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">E-Biblio</h1>
            <span className="text-[10px] text-white/60 uppercase tracking-widest mt-0.5">Université Protestante au Congo</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "nav-item cursor-pointer", 
                  isActive ? "active" : "text-white/70"
                )}
                data-testid={`nav-${item.href.slice(1)}`}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-secondary" : "text-white/50")} />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/5 mb-3 shadow-sm backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold shadow-inner shrink-0">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/60">{ROLE_LABELS[userRole] || userRole}</p>
          </div>
        </div>
        
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <header className="fixed top-0 left-0 right-0 h-14 z-[100] md:hidden bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Ouvrir le menu"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="flex items-center gap-2">
          <img src={upcLogoPath} alt="UPC" className="h-7 w-7 object-contain" />
          <span className="font-display font-bold text-slate-900 text-base">E-Biblio</span>
        </div>

        <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
          {user?.firstName?.[0] || 'U'}
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-primary border-r border-slate-200 flex flex-col text-white shadow-2xl">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white hover:bg-white/10 rounded-lg z-10 transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-primary border-r border-slate-200 hidden md:flex flex-col text-white shadow-xl">
        {sidebarContent}
      </aside>
    </>
  );
}
