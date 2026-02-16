import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Resources from "@/pages/Resources";
import ExternalSearch from "@/pages/ExternalSearch";
import Rewards from "@/pages/Rewards";
import AdminApprovals from "@/pages/AdminApprovals";
import SuperAdmin from "@/pages/SuperAdmin";
import AcademicSources from "@/pages/AcademicSources";
import Suggestions from "@/pages/Suggestions";
import SubmitResource from "@/pages/SubmitResource";
import Documentation from "@/pages/Documentation";
import UserProfile from "@/pages/UserProfile";
import LibraryAdmin from "@/pages/LibraryAdmin";

function ProtectedRoute({ component: Component, adminOnly = false, superAdminOnly = false, libraryAdminOnly = false }: { component: React.ComponentType, adminOnly?: boolean, superAdminOnly?: boolean, libraryAdminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  const userRole = (user as any).role || 'student';
  
  if (superAdminOnly && userRole !== 'super_admin') {
    return <Redirect to="/dashboard" />;
  }

  if (libraryAdminOnly && userRole !== 'admin' && userRole !== 'super_admin') {
    return <Redirect to="/dashboard" />;
  }

  if (adminOnly && !['professor', 'director', 'admin', 'super_admin'].includes(userRole)) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
     return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Route */}
      <Route path="/">
        {user ? <Redirect to="/dashboard" /> : <Landing />}
      </Route>

      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/resources">
        <ProtectedRoute component={Resources} />
      </Route>
      <Route path="/search">
        <ProtectedRoute component={ExternalSearch} />
      </Route>
      <Route path="/rewards">
        <ProtectedRoute component={Rewards} />
      </Route>
      <Route path="/submit">
        <ProtectedRoute component={SubmitResource} />
      </Route>
      <Route path="/sources">
        <ProtectedRoute component={AcademicSources} />
      </Route>
      <Route path="/suggestions">
        <ProtectedRoute component={Suggestions} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={UserProfile} />
      </Route>
      <Route path="/approvals">
        <ProtectedRoute component={AdminApprovals} adminOnly={true} />
      </Route>
      <Route path="/library-admin">
        <ProtectedRoute component={LibraryAdmin} libraryAdminOnly={true} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={SuperAdmin} superAdminOnly={true} />
      </Route>
      <Route path="/documentation">
        <ProtectedRoute component={Documentation} />
      </Route>

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
