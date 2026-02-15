import { Resource, RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS, SOURCE_LABELS } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Book, FileText, GraduationCap, Database, Archive, BookOpen, ExternalLink, Trash2, Check, X } from "lucide-react";
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
    switch (type) {
      case 'article': return <FileText className="w-5 h-5" />;
      case 'journal': return <BookOpen className="w-5 h-5" />;
      case 'thesis': return <GraduationCap className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'archive': return <Archive className="w-5 h-5" />;
      default: return <Book className="w-5 h-5" />;
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
      case 'openlibrary': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'doaj': return 'bg-green-100 text-green-700 border-green-200';
      case 'internal': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'core': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'arxiv': return 'bg-red-100 text-red-700 border-red-200';
      case 'pubmed': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'hal': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'ajol': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col h-full relative overflow-hidden" data-testid={`card-resource-${resource.id}`}>
      <div className={cn(
        "absolute top-0 left-0 w-full h-1", 
        resource.status === 'pending' ? "bg-yellow-400" : resource.status === 'rejected' ? "bg-red-400" : "bg-primary"
      )} />

      <div className="flex justify-between items-start mb-3 gap-2">
        <div className="flex gap-1.5 flex-wrap">
          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", getSourceColor(resource.source))}>
            {SOURCE_LABELS[resource.source] || resource.source}
          </span>
          {resource.discipline && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-100">
              {DISCIPLINE_LABELS[resource.discipline] || resource.discipline}
            </span>
          )}
        </div>
        <div className="text-slate-400 group-hover:text-primary transition-colors shrink-0">
          {getTypeIcon(resource.type)}
        </div>
      </div>

      <h3 className="font-display font-bold text-base leading-tight mb-2 text-foreground line-clamp-2">
        {resource.title}
      </h3>

      <div className="text-sm text-muted-foreground mb-3 space-y-0.5">
        <p className="font-medium text-slate-600 text-sm">{resource.author || "Auteur inconnu"}</p>
        <p className="text-xs text-slate-400">
          {RESOURCE_TYPE_LABELS[resource.type] || resource.type}
          {resource.publicationYear && ` \u2022 ${resource.publicationYear}`}
          {resource.language && ` \u2022 ${resource.language.toUpperCase()}`}
        </p>
      </div>

      {resource.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{resource.description}</p>
      )}

      {resource.status === 'pending' && (
        <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 mb-3 w-fit">
          En attente d'approbation
        </span>
      )}

      <div className="mt-auto pt-3 border-t border-slate-50 flex flex-col gap-2">
        {resource.url && (
          <div className="flex gap-2 w-full">
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-primary/10 text-primary rounded-lg text-xs py-2 h-9 flex items-center justify-center font-medium hover:bg-primary/20 transition-colors"
              data-testid={`link-resource-${resource.id}`}
            >
              Consulter <ExternalLink className="w-3 h-3 ml-1.5" />
            </a>
          </div>
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
              if (confirm('Supprimer cette ressource ?')) {
                deleteMutation.mutate(resource.id);
              }
            }}
            className="p-2 text-slate-400 hover:text-destructive transition-colors self-end"
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
