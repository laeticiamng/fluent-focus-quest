import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { type UploadedFile } from "@/services/contextBundle";
import { FileText, X, Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PdfUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles: number;
  maxSizeMb: number;
}

export function PdfUploader({ files, onFilesChange, maxFiles, maxSizeMb }: PdfUploaderProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const remaining = maxFiles - files.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${maxFiles} fichiers autorises`);
      return;
    }

    const toAdd = selectedFiles.slice(0, remaining);
    const newFiles: UploadedFile[] = [];

    for (const file of toAdd) {
      if (file.type !== "application/pdf") {
        toast.error(`${file.name}: seuls les PDF sont acceptes`);
        continue;
      }
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name}: taille max ${maxSizeMb} Mo`);
        continue;
      }

      // Upload to storage if user is authenticated
      if (user) {
        const path = `${user.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage
          .from("context-pdfs")
          .upload(path, file);

        if (error) {
          toast.error(`Erreur upload: ${file.name}`);
          console.error("Upload error:", error);
          continue;
        }

        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          path,
        });
      } else {
        // Local only
        newFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    }

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
      toast.success(`${newFiles.length} fichier(s) ajoute(s)`);
    }

    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }, [files, maxFiles, maxSizeBytes, maxSizeMb, onFilesChange, user]);

  const handleRemove = useCallback(async (idx: number) => {
    const file = files[idx];
    if (file.path && user) {
      await supabase.storage.from("context-pdfs").remove([file.path]);
    }
    onFilesChange(files.filter((_, i) => i !== idx));
  }, [files, onFilesChange, user]);

  return (
    <div
      className="rounded-xl p-3 space-y-2"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border) / 0.3)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold">PDF complementaires</span>
        <span className="text-[9px] text-muted-foreground">{files.length}/{maxFiles} · max {maxSizeMb} Mo</span>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg p-1.5 bg-muted/30">
              <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-[10px] font-medium flex-1 truncate">{file.name}</span>
              <span className="text-[8px] text-muted-foreground">{(file.size / 1024).toFixed(0)} Ko</span>
              <button
                onClick={() => handleRemove(i)}
                className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {files.length < maxFiles && (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-muted-foreground/20 hover:border-primary/30 hover:bg-primary/5 transition-colors"
        >
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Ajouter un PDF</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {files.length >= maxFiles && (
        <div className="flex items-center gap-1.5 text-[9px] text-amber-400">
          <AlertCircle className="w-3 h-3" />
          Nombre maximum de fichiers atteint
        </div>
      )}
    </div>
  );
}
