import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/Sidebar";
import { useCreateResource } from "@/hooks/use-resources";
import { RESOURCE_TYPE_LABELS, DISCIPLINE_LABELS, SOURCE_LABELS } from "@shared/schema";
import { Upload, Send, ArrowLeft, FileText, Image, File, X, Eye, Loader2, AlertCircle, Paperclip } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_TOTAL_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FORMATS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "text/plain": "TXT",
  "text/csv": "CSV",
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WEBP",
};
const ACCEPT_STRING = Object.keys(ACCEPTED_FORMATS).join(",");

interface UploadedFile {
  file: File;
  objectPath: string | null;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  previewUrl?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type === "application/pdf") return FileText;
  return File;
}

export default function SubmitResource() {
  const [, navigate] = useLocation();
  const createMutation = useCreateResource();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    type: 'book',
    source: 'internal',
    discipline: '',
    language: 'fr',
    url: '',
    isbn: '',
    publisher: '',
    publicationYear: undefined as number | undefined,
  });

  const totalSize = uploadedFiles.reduce((sum, f) => sum + f.file.size, 0);
  const isUploading = uploadedFiles.some(f => f.status === "uploading");
  const hasPendingOrError = uploadedFiles.some(f => f.status === "pending" || f.status === "error");
  const filesReady = uploadedFiles.length === 0 || uploadedFiles.every(f => f.status === "done");

  const uploadSingleFile = useCallback(async (file: File, index: number) => {
    setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, status: "uploading", progress: 10 } : f));

    try {
      const res = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
      });
      if (!res.ok) throw new Error("Impossible d'obtenir l'URL d'envoi");
      const { uploadURL, objectPath } = await res.json();

      setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 40 } : f));

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!putRes.ok) throw new Error("Échec de l'envoi du fichier");

      setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, status: "done", progress: 100, objectPath } : f));
    } catch (err: any) {
      setUploadedFiles(prev => prev.map((f, i) => i === index ? { ...f, status: "error", error: err.message, progress: 0 } : f));
    }
  }, []);

  const addFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const errors: string[] = [];
    const validFiles: File[] = [];
    let newTotal = totalSize;

    for (const file of fileArray) {
      if (!ACCEPTED_FORMATS[file.type]) {
        errors.push(`"${file.name}" : format non supporté`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" : dépasse 2 Mo (${formatFileSize(file.size)})`);
        continue;
      }
      if (newTotal + file.size > MAX_TOTAL_SIZE) {
        errors.push(`"${file.name}" : limite totale de 10 Mo dépassée`);
        continue;
      }
      const isDuplicate = uploadedFiles.some(f => f.file.name === file.name && f.file.size === file.size);
      if (isDuplicate) {
        errors.push(`"${file.name}" : fichier déjà ajouté`);
        continue;
      }
      validFiles.push(file);
      newTotal += file.size;
    }

    if (errors.length > 0) {
      toast({ title: "Fichiers refusés", description: errors.join(". "), variant: "destructive" });
    }

    if (validFiles.length > 0) {
      const newEntries: UploadedFile[] = validFiles.map(file => ({
        file,
        objectPath: null,
        status: "pending" as const,
        progress: 0,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }));

      setUploadedFiles(prev => {
        const updated = [...prev, ...newEntries];
        const startIdx = prev.length;
        validFiles.forEach((file, i) => {
          uploadSingleFile(file, startIdx + i);
        });
        return updated;
      });
    }
  }, [totalSize, uploadedFiles, toast, uploadSingleFile]);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => {
      const file = prev[index];
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
    if (previewFile && uploadedFiles[index] === previewFile) {
      setPreviewFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const normalizeObjectPath = (path: string) => path.startsWith("/objects/") ? path : `/objects/${path}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    if (isUploading) {
      toast({ title: "Envoi en cours", description: "Veuillez attendre la fin de l'envoi des fichiers.", variant: "destructive" });
      return;
    }
    if (hasPendingOrError) {
      toast({ title: "Fichiers non prêts", description: "Certains fichiers ont échoué ou sont en attente. Supprimez-les ou réessayez avant de soumettre.", variant: "destructive" });
      return;
    }

    const fileUrls = uploadedFiles.filter(f => f.status === "done" && f.objectPath).map(f => normalizeObjectPath(f.objectPath!));

    createMutation.mutate({
      title: formData.title,
      author: formData.author || undefined,
      description: formData.description || undefined,
      type: formData.type,
      source: formData.source,
      discipline: formData.discipline || undefined,
      language: formData.language || 'fr',
      url: formData.url || undefined,
      isbn: formData.isbn || undefined,
      publisher: formData.publisher || undefined,
      publicationYear: formData.publicationYear || undefined,
      fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
    }, {
      onSuccess: () => {
        navigate('/resources');
      }
    });
  };

  const update = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
        <header className="mb-6 md:mb-8">
          <Link href="/resources">
            <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-4 transition-colors" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" /> Retour au catalogue
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 leading-tight" data-testid="text-submit-title">
                Soumettre une Ressource
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Ajoutez une nouvelle ressource à la bibliothèque. Elle sera examinée par un administrateur.
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Titre de la ressource *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => update('title', e.target.value)}
                  required
                  placeholder="Ex: Introduction au Droit Civil Congolais"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Auteur(s)</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => update('author', e.target.value)}
                  placeholder="Ex: Prof. Jean Mukendi"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-author"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Éditeur / Publication</label>
                <input
                  type="text"
                  value={formData.publisher}
                  onChange={(e) => update('publisher', e.target.value)}
                  placeholder="Ex: Éditions UPC"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-publisher"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Type de ressource *</label>
                <select
                  value={formData.type}
                  onChange={(e) => update('type', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-type"
                >
                  {Object.entries(RESOURCE_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => update('source', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-source"
                >
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Discipline</label>
                <select
                  value={formData.discipline}
                  onChange={(e) => update('discipline', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-discipline"
                >
                  <option value="">-- Sélectionner --</option>
                  {Object.entries(DISCIPLINE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Langue</label>
                <select
                  value={formData.language}
                  onChange={(e) => update('language', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all"
                  data-testid="select-resource-language"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                  <option value="lingala">Lingala</option>
                  <option value="swahili">Swahili</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Année de publication</label>
                <input
                  type="number"
                  value={formData.publicationYear || ''}
                  onChange={(e) => update('publicationYear', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ex: 2024"
                  min={1900}
                  max={2100}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-year"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">ISBN (si applicable)</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => update('isbn', e.target.value)}
                  placeholder="978-..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-isbn"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">URL / Lien vers la ressource</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => update('url', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  data-testid="input-resource-url"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder="Décrivez brièvement le contenu de cette ressource..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition-all"
                  data-testid="input-resource-description"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" />
                  Fichiers joints
                </span>
              </label>
              <p className="text-xs text-slate-400 mb-3">
                Max 2 Mo par fichier, 10 Mo au total. Formats : PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV, JPEG, PNG, WEBP
              </p>

              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
                  isDragging ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                data-testid="dropzone-files"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={ACCEPT_STRING}
                  onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
                  className="hidden"
                  data-testid="input-file-upload"
                />
                <Upload className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm text-slate-500">
                  Glissez-déposez vos fichiers ici ou <span className="text-primary font-medium">parcourir</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatFileSize(totalSize)} / {formatFileSize(MAX_TOTAL_SIZE)} utilisés
                </p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2" data-testid="list-uploaded-files">
                  {uploadedFiles.map((uf, idx) => {
                    const Icon = getFileIcon(uf.file.type);
                    const ext = ACCEPTED_FORMATS[uf.file.type] || uf.file.name.split('.').pop()?.toUpperCase() || "?";
                    return (
                      <div
                        key={`${uf.file.name}-${idx}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                        data-testid={`file-item-${idx}`}
                      >
                        {uf.previewUrl ? (
                          <img src={uf.previewUrl} alt={uf.file.name} className="w-10 h-10 rounded object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-slate-200 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-slate-500" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">{uf.file.name}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">{formatFileSize(uf.file.size)}</span>
                            <Badge variant="outline" className="text-[10px] no-default-hover-elevate no-default-active-elevate">{ext}</Badge>
                            {uf.status === "uploading" && (
                              <span className="text-xs text-blue-500 flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" /> Envoi {uf.progress}%
                              </span>
                            )}
                            {uf.status === "done" && (
                              <span className="text-xs text-green-600">Envoyé</span>
                            )}
                            {uf.status === "error" && (
                              <span className="text-xs text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {uf.error}
                              </span>
                            )}
                          </div>
                          {uf.status === "uploading" && (
                            <div className="w-full bg-slate-200 rounded-full h-1 mt-1.5">
                              <div className="bg-primary h-1 rounded-full transition-all" style={{ width: `${uf.progress}%` }} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {uf.status === "done" && (uf.previewUrl || uf.file.type === "application/pdf") && (
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); setPreviewFile(uf); }}
                              title="Aperçu"
                              data-testid={`button-preview-${idx}`}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                            title="Supprimer"
                            data-testid={`button-remove-file-${idx}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={createMutation.isPending || !formData.title.trim() || !filesReady}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold shadow-md shadow-primary/25 hover:shadow-lg transition-all disabled:opacity-50"
                data-testid="button-submit-resource"
              >
                <Send className="w-4 h-4" />
                {createMutation.isPending ? "Envoi en cours..." : isUploading ? "Envoi des fichiers..." : hasPendingOrError ? "Fichiers non prêts" : "Soumettre pour approbation"}
              </button>
              <Link href="/resources">
                <button
                  type="button"
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Comment fonctionne la soumission ?</p>
              <p className="text-xs text-blue-700/70 mt-1 leading-relaxed">
                Votre ressource sera soumise avec le statut "En attente". Un professeur, directeur ou administrateur examinera et approuvera votre soumission. 
                Vous gagnerez <strong>50 points</strong> pour chaque ressource approuvée !
              </p>
            </div>
          </div>
        </form>

        {previewFile && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}
            data-testid="modal-preview"
          >
            <Card
              className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 p-4 border-b border-slate-100">
                <div className="flex items-center gap-2 min-w-0">
                  <Eye className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 truncate">{previewFile.file.name}</span>
                  <Badge variant="outline" className="text-[10px] shrink-0 no-default-hover-elevate no-default-active-elevate">
                    {formatFileSize(previewFile.file.size)}
                  </Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setPreviewFile(null)}
                  data-testid="button-close-preview"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50">
                {previewFile.previewUrl && previewFile.file.type.startsWith("image/") ? (
                  <img
                    src={previewFile.previewUrl}
                    alt={previewFile.file.name}
                    className="max-w-full max-h-[70vh] object-contain rounded"
                    data-testid="preview-image"
                  />
                ) : previewFile.file.type === "application/pdf" && previewFile.objectPath ? (
                  <iframe
                    src={normalizeObjectPath(previewFile.objectPath)}
                    className="w-full h-[70vh] rounded border border-slate-200"
                    title={previewFile.file.name}
                    data-testid="preview-pdf"
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-sm text-slate-500">Aperçu non disponible pour ce format.</p>
                    {previewFile.objectPath && (
                      <a
                        href={normalizeObjectPath(previewFile.objectPath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary mt-2 inline-block"
                        data-testid="link-open-file"
                      >
                        Ouvrir dans un nouvel onglet
                      </a>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
