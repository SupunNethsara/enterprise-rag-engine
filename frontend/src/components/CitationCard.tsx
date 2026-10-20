'use client';

import React, { useState } from 'react';
import { Citation } from '@/types/rag';
import { ChevronDown, ChevronUp, FileText, CheckCircle2 } from 'lucide-react';

interface CitationCardProps {
  citation: Citation;
  index: number;
}

export const CitationCard: React.FC<CitationCardProps> = ({ citation, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const similarityPercent = citation.score != null ? Math.round(citation.score * 100) : null;

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-900/60 text-xs transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-medium text-[11px] shrink-0">
            {index + 1}
          </div>
          <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
            {citation.sourceFilename}
          </span>
          {citation.pageNumber && (
            <span className="text-slate-400 dark:text-slate-500 shrink-0">
              (p. {citation.pageNumber})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {similarityPercent !== null && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {similarityPercent}% match
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-3 pt-1 border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
          {citation.content}
        </div>
      )}
    </div>
  );
};
