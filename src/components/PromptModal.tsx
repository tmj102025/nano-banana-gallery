import { useEffect, useState } from 'react';
import type { Prompt } from '../types';

interface PromptModalProps {
  prompt: Prompt | null;
  onClose: () => void;
}

export function PromptModal({ prompt, onClose }: PromptModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setActiveImg(0);
    setCopied(false);
  }, [prompt]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (prompt) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [prompt]);

  if (!prompt) return null;

  function copyPrompt() {
    navigator.clipboard.writeText(prompt!.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image gallery */}
        {prompt.images.length > 0 && (
          <div className="bg-zinc-950 rounded-t-2xl overflow-hidden">
            <img
              src={prompt.images[activeImg]}
              alt={prompt.title}
              className="w-full max-h-96 object-contain"
            />
            {prompt.images.length > 1 && (
              <div className="flex gap-1.5 p-2 overflow-x-auto">
                {prompt.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImg === i ? 'border-violet-500' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start gap-2 pr-6">
            <div className="flex-1">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {prompt.categories.map(cat => (
                  <span key={cat} className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full border border-violet-500/30">
                    {cat}
                  </span>
                ))}
                <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-xs rounded-full uppercase">
                  {prompt.language}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 leading-snug">
                {prompt.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          {prompt.description && (
            <p className="text-sm text-zinc-400 leading-relaxed">
              {prompt.description}
            </p>
          )}

          {/* Prompt text */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Prompt</span>
              <button
                onClick={copyPrompt}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  copied
                    ? 'bg-green-600/20 text-green-400 border border-green-600/40'
                    : 'bg-violet-600 hover:bg-violet-500 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Prompt
                  </>
                )}
              </button>
            </div>
            <pre className="bg-zinc-950 rounded-xl p-4 text-xs text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap border border-zinc-800 font-mono">
              {prompt.content}
            </pre>
          </div>

          {/* Footer: author */}
          <div className="pt-1 border-t border-zinc-800">
            <div className="text-xs text-zinc-500">
              By <span className="text-zinc-300">{prompt.author.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
