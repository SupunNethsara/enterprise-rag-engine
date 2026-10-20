import { DocumentRecord, ChatResponse } from '@/types/rag';

// In Next.js with rewrites, use relative paths so all requests stay same-origin (0 CORS issues!)
const API_BASE_URL = '';

export async function uploadDocument(file: File): Promise<DocumentRecord> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Failed to upload document (${res.status})`);
  }

  return res.json();
}

export async function fetchDocuments(): Promise<DocumentRecord[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/documents`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch documents (${res.status})`);
  }

  return res.json();
}

export async function sendChatMessage(query: string, topK: number = 4): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, topK }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Chat query failed (${res.status})`);
  }

  return res.json();
}
