"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Image, FileText, X, CheckCircle2, Loader2, Cloud, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { getPresignedUploadUrl, uploadFileToS3 } from "@/services/api";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: string;
  progress: number;
  status: "uploading" | "done" | "error";
  s3Key?: string;
  publicUrl?: string;
  errorMsg?: string;
}

interface FileUploadZoneProps {
  userId?: string;
  goalId?: string;
  onUploadComplete?: (key: string, publicUrl: string, fileName: string) => void;
}

export function FileUploadZone({
  userId = "usr_1",
  goalId,
  onUploadComplete,
}: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileType = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
    if (["pdf"].includes(ext)) return "pdf";
    return "file";
  };

  const formatSize = (bytes: number) =>
    bytes > 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;

  const uploadFile = async (file: File) => {
    const id = `file_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const newFile: UploadedFile = {
      id,
      name: file.name,
      size: formatSize(file.size),
      type: getFileType(file.name),
      progress: 0,
      status: "uploading",
    };

    setFiles((prev) => [...prev, newFile]);

    try {
      // Step 1 — get presigned URL from our API → AWS S3
      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, progress: 15 } : f));

      const { uploadUrl, key, publicUrl } = await getPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        userId,
        goalId,
      });

      setFiles((prev) => prev.map((f) => f.id === id ? { ...f, progress: 35 } : f));

      // Step 2 — PUT directly to S3 using presigned URL
      // Simulate progress during upload using XHR for real progress events
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = 35 + Math.round((e.loaded / e.total) * 60);
            setFiles((prev) => prev.map((f) => f.id === id ? { ...f, progress: pct } : f));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.statusText}`));
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      // Step 3 — mark done
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, progress: 100, status: "done", s3Key: key, publicUrl }
            : f
        )
      );

      onUploadComplete?.(key, publicUrl, file.name);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Upload failed";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "error", errorMsg } : f
        )
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    Array.from(e.dataTransfer.files).forEach(uploadFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(uploadFile);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const removeFile = (id: string) =>
    setFiles((prev) => prev.filter((f) => f.id !== id));

  const getFileIcon = (type: string) => {
    if (type === "image") return <Image className="h-4 w-4 text-blue-500" />;
    if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />;
    return <File className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
          dragging
            ? "border-primary bg-primary/8 scale-[1.01]"
            : "border-border hover:border-primary/50 hover:bg-primary/3"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInput}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />
        <motion.div
          animate={{ y: dragging ? -4 : 0 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center transition-colors",
            dragging ? "bg-primary/20" : "bg-muted"
          )}>
            {dragging
              ? <Cloud className="h-6 w-6 text-primary" />
              : <Upload className="h-6 w-6 text-muted-foreground" />}
          </div>
          <div>
            <p className="font-semibold text-sm">
              {dragging ? "Drop to upload to S3" : "Drag & drop files"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse · Uploads directly to AWS S3
            </p>
          </div>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.map((file) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, x: -20, height: 0 }}
            className={cn(
              "glass rounded-xl p-4 border",
              file.status === "error" && "border-destructive/30 bg-destructive/5",
              file.status === "done" && "border-green-500/20"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {getFileIcon(file.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{file.size}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {file.status === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                )}
                {file.status === "done" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {file.status === "error" && (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="h-6 w-6 flex items-center justify-center rounded hover:bg-accent transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {file.status === "uploading" && (
              <div className="space-y-1">
                <Progress value={file.progress} className="h-1" />
                <p className="text-[10px] text-muted-foreground text-right">{file.progress}%</p>
              </div>
            )}

            {file.status === "done" && file.s3Key && (
              <p className="text-[10px] text-green-500 font-mono truncate mt-1">
                ✓ s3://{file.s3Key}
              </p>
            )}

            {file.status === "error" && (
              <p className="text-[10px] text-destructive mt-1">⚠️ {file.errorMsg}</p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
