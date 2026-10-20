'use client';

import React, { useState, useRef } from 'react';
import { DocumentRecord } from '@/types/rag';
import { uploadDocument } from '@/lib/api';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw, Database } from 'lucide-react';

interface DocumentSidebarProps {
  documents: DocumentRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onDocumentUploaded: (doc: DocumentRecord) => void;
}

export const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
  documents,
  isLoading,
  onRefresh,
  onDocumentUploaded,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const newDoc = await uploadDocument(file);
      onDocumentUploaded(newDoc);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/50 h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Knowledge Base</h2>
            <p className="text-[11px] text-slate-500">PostgreSQL pgvector Store</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          title="Refresh Documents"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Upload Box */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.json,.csv"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isUploading
              ? 'border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 cursor-not-allowed'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/30'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-blue-600 dark:text-blue-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs font-medium">Chunking & Embedding...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-center">
              <UploadCloud className="w-6 h-6 text-slate-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Upload New Document
              </span>
              <span className="text-[10px] text-slate-400">PDF, TXT, Markdown, CSV</span>
            </div>
          )}
        </label>

        {uploadError && (
          <div className="mt-2.5 p-2 rounded-md bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 flex items-start gap-1.5 text-[11px] text-red-600 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
          <span>Indexed Documents</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px]">
            {documents.length}
          </span>
        </div>

        {documents.length === 0 && !isLoading && (
          <div className="text-center py-8 text-xs text-slate-400">
            No documents indexed yet. Upload a PDF or Text file to get started!
          </div>
        )}

        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-lg shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate" title={doc.filename}>
                  {doc.filename}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                  <span>{formatFileSize(doc.sizeBytes)}</span>
                  <span>•</span>
                  <span>{doc.chunkCount} vector {doc.chunkCount === 1 ? 'chunk' : 'chunks'}</span>
                </div>
              </div>
              {doc.status === 'COMPLETED' ? (
                <span title="Ready for query">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                </span>
              ) : doc.status === 'INDEXING' ? (
                <span title="Indexing">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0 mt-0.5" />
                </span>
              ) : (
                <span title="Failed">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
