import { useState } from "react";
import { Resource, RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS, SOURCE_LABELS } from "@shared/schema";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Book, FileText, GraduationCap, Database, Archive, BookOpen, ExternalLink, Trash2, Check, X, Paperclip, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUpdateResource, useDeleteResource } from "@/hooks/use-resources";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ResourceCardProps {
  resource: Resource;
  showActions?: boolean;
}

function getFileExtFromPath(path: string): string {
  const parts = path.split('/');
  const name = parts[parts.length - 1] || '';
  const dot = name.lastIndexOf('.');
  if (dot > 0) return name.substring(dot + 1).toUpperCase();
  return "FILE";
}

function normalizeFileUrl(path: string): string {
  return path.startsWith("/objects/") ? path : `/objects/${path}`;
}

function FilePreviewModal({ fileUrls, onClose }: { fileUrls: string[]; onClose: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const url = normalizeFileUrl(fileUrls[activeIdx]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose} data-testid="modal-resource-preview">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto">
            {fileUrls.map((f, i) => (
              <Button
                key={i}
                size="sm"
                variant={i === activeIdx ? "default" : "outline"}
                onClick={() => setActiveIdx(i)}
                data-testid={`button-file-tab-${i}`}
              >
                <Paperclip className="w-3 h-3 mr-1" />
                Fichier {i + 1}
              </Button>
            ))}
          </div>
          <Button size="icon" variant="ghost" onClick={onClose} data-testid="button-close-resource-preview">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50 min-h-[300px]">
          {url && (url.endsWith('.pdf') || url.includes('application/pdf')) ? (
            <iframe src={url} className="w-full h-[70vh] rounded border border-slate-200" title="Aperçu PDF" data-testid="preview-resource-pdf" />
          ) : url && /\.(jpe?g|png|webp|gif)$/i.test(url) ? (
            <img src={url} alt="Aperçu" className="max-w-full max-h-[70vh] object-contain rounded" data-testid="preview-resource-image" />
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-sm text-slate-500 mb-2">Aperçu non disponible pour ce format.</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-medium" data-testid="link-download-file">
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function ResourceCard({ resource, showActions = false }: ResourceCardProps) {
  const { user } = useAuth();
  const updateMutation = useUpdateResource();
  const deleteMutation = useDeleteResource();
  const [showPreview, setShowPreview] = useState(false);
  const fileUrls = (resource as any).fileUrls as string[] | null;
  
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

      {fileUrls && fileUrls.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2">
          <Paperclip className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">{fileUrls.length} fichier{fileUrls.length > 1 ? 's' : ''} joint{fileUrls.length > 1 ? 's' : ''}</span>
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-slate-50 flex flex-col gap-2">
        <div className="flex gap-2 w-full flex-wrap">
          {resource.url && (
            <a 
              href={resource.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 bg-primary/10 text-primary rounded-lg text-xs py-2 h-9 flex items-center justify-center font-medium hover:bg-primary/20 transition-colors"
              data-testid={`link-resource-${resource.id}`}
            >
              Consulter <ExternalLink className="w-3 h-3 ml-1.5" />
            </a>
          )}
          {fileUrls && fileUrls.length > 0 && (
            <button
              onClick={() => setShowPreview(true)}
              className="flex-1 bg-slate-100 text-slate-700 rounded-lg text-xs py-2 h-9 flex items-center justify-center font-medium hover:bg-slate-200 transition-colors"
              data-testid={`button-preview-resource-${resource.id}`}
            >
              <Eye className="w-3 h-3 mr-1.5" /> Aperçu
            </button>
          )}
        </div>

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

      {showPreview && fileUrls && fileUrls.length > 0 && (
        <FilePreviewModal fileUrls={fileUrls} onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
