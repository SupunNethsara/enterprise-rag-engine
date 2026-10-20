'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DocumentRecord } from '@/types/rag';
import { fetchDocuments } from '@/lib/api';
import { DocumentSidebar } from '@/components/DocumentSidebar';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState<boolean>(true);

  const loadDocuments = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const docs = await fetchDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to load documents', err);
    } finally {
      setIsLoadingDocs(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDocumentUploaded = (newDoc: DocumentRecord) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-100 dark:bg-black font-sans">
      <DocumentSidebar
        documents={documents}
        isLoading={isLoadingDocs}
        onRefresh={loadDocuments}
        onDocumentUploaded={handleDocumentUploaded}
      />
      <ChatInterface />
    </main>
  );
}
