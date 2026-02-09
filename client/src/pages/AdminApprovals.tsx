import { Sidebar } from "@/components/Sidebar";
import { ResourceCard } from "@/components/ResourceCard";
import { useResources } from "@/hooks/use-resources";
import { CheckSquare } from "lucide-react";

export default function AdminApprovals() {
  // Fetch pending resources
  const { data: resources, isLoading } = useResources({ status: 'pending' });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-slate-900">Pending Approvals</h1>
          <p className="text-slate-500 mt-1">Review resources submitted by students and staff.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-xl animate-pulse" />)}
          </div>
        ) : resources?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckSquare className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">All caught up!</h3>
            <p className="text-slate-500">There are no pending resources to review.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources?.map((resource) => (
              <ResourceCard 
                key={resource.id} 
                resource={resource} 
                showActions={true} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
