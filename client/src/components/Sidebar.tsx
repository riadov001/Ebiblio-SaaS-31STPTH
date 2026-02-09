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
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const userRole = (user as any)?.role || 'student';

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/resources", label: "Catalogue", icon: Library },
    { href: "/search", label: "Recherche externe", icon: Search },
    { href: "/rewards", label: "Récompenses", icon: Award },
  ];

  if (userRole === 'director' || userRole === 'professor' || userRole === 'super_admin') {
    navItems.push({ href: "/approvals", label: "Approbations", icon: CheckSquare });
  }

  if (userRole === 'super_admin') {
    navItems.push({ href: "/admin", label: "Super Admin", icon: Shield });
  }

  const roleLabels: Record<string, string> = {
    student: "Étudiant",
    professor: "Professeur",
    director: "Directeur",
    super_admin: "Super Admin",
  };

  const sidebarContent = (
    <>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm overflow-hidden p-1">
            <img 
              src="https://upc.ac.cd/wp-content/uploads/2019/04/logo-upc.png" 
              alt="UPC Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">UPC</h1>
            <span className="text-[10px] text-white/70 uppercase tracking-widest mt-1">Bibliothèque</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
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
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10 border border-white/5 mb-3 shadow-sm backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold shadow-inner">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-white/60">{roleLabels[userRole] || userRole}</p>
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
      <button 
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden bg-white border border-slate-200 rounded-lg p-2 shadow-sm"
        data-testid="button-mobile-menu"
      >
        <Menu className="w-5 h-5 text-slate-600" />
      </button>

      {mobileOpen && (
        <div className="flex inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-primary border-r border-slate-200 flex flex-col text-white shadow-xl">
            <button 
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-primary border-r border-slate-200 hidden md:flex flex-col text-white shadow-xl">
        {sidebarContent}
      </aside>
    </>
  );
}
