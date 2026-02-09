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
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
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

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 border-r border-slate-200 hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3 text-primary font-display font-bold text-xl">
          <BookOpen className="w-8 h-8" />
          <span>E-Biblio UPC</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "nav-item cursor-pointer", 
                isActive ? "active" : "text-slate-500"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-slate-400")} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 mb-3 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-foreground">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
          </div>
        </div>
        
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
