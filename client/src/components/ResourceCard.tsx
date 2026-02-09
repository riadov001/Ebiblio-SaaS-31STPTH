import { Resource } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Book, FileText, ExternalLink, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateResource, useDeleteResource } from "@/hooks/use-resources";

interface ResourceCardProps {
  resource: Resource;
  showActions?: boolean;
}

export function ResourceCard({ resource, showActions = false }: ResourceCardProps) {
  const { user } = useAuth();
  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();
  
  const userRole = (user as any)?.role || 'student';
  const isAdmin = userRole === 'director' || userRole === 'professor' || userRole === 'super_admin';

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'article': return <FileText className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'openlibrary': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'doaj': return 'bg-green-100 text-green-700 border-green-200';
      case 'internal': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'approved': return 'Approuvée';
      case 'rejected': return 'Rejetée';
      default: return status;
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col h-full relative overflow-hidden" data-testid={`card-resource-${resource.id}`}>
      <div className={cn(
        "absolute top-0 left-0 w-full h-1", 
        resource.status === 'pending' ? "bg-yellow-400" : resource.status === 'rejected' ? "bg-red-400" : "bg-primary"
      )} />

      <div className="flex justify-between items-start mb-3">
        <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider", getSourceColor(resource.source))}>
          {resource.source}
        </span>
        <div className="text-slate-400 group-hover:text-primary transition-colors">
          {getTypeIcon(resource.type)}
        </div>
      </div>

      <h3 className="font-display font-bold text-lg leading-tight mb-2 text-foreground line-clamp-2">
        {resource.title}
      </h3>

      <div className="text-sm text-muted-foreground mb-4 space-y-1">
        <p className="font-medium text-slate-600">{resource.author || "Auteur inconnu"}</p>
        <p>{resource.publicationYear} {resource.createdAt && `\u2022 Ajouté le ${format(new Date(resource.createdAt), 'd MMM yyyy', { locale: fr })}`}</p>
      </div>

      {resource.status === 'pending' && (
        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 mb-3 w-fit">
          {getStatusLabel(resource.status)}
        </span>
      )}

      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-3">
        {resource.url && (
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 btn-secondary text-xs py-2 h-9"
            data-testid={`link-resource-${resource.id}`}
          >
            Accéder <ExternalLink className="w-3 h-3 ml-2" />
          </a>
        )}

        {isAdmin && showActions && resource.status === 'pending' && (
          <div className="flex gap-2">
            <button 
              onClick={() => updateMutation.mutate({ id: resource.id, status: 'approved' })}
              disabled={updateMutation.isPending}
              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 transition-colors"
              title="Approuver"
              data-testid={`button-approve-${resource.id}`}
            >
              <Check className="w-4 h-4" />
            </button>
            <button 
              onClick={() => updateMutation.mutate({ id: resource.id, status: 'rejected' })}
              disabled={updateMutation.isPending}
              className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 transition-colors"
              title="Rejeter"
              data-testid={`button-reject-${resource.id}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {isAdmin && !showActions && (
          <button 
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
                deleteMutation.mutate(resource.id);
              }
            }}
            className="p-2 text-slate-400 hover:text-destructive transition-colors"
            title="Supprimer"
            data-testid={`button-delete-resource-${resource.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
