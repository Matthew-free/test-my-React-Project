// src/components/CreateWebsiteModal.tsx
import React, { useEffect, useState } from "react";
import { generateWebsiteContent, type WebsiteContent } from "../services/geminiService";
import { SparklesIcon, LoaderIcon } from "./icons";

interface CreateWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (content: WebsiteContent) => void;
}

export default function CreateWebsiteModal({ isOpen, onClose, onCreate }: CreateWebsiteModalProps) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 모달이 열릴 때 입력 초기화
  useEffect(() => {
    if (isOpen) setPrompt("");
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const content = await generateWebsiteContent(prompt);
      onCreate(content);
      setPrompt("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackgroundClick}
    >
      <div className="bg-slate-800 rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <SparklesIcon className="text-indigo-400" />
          <h2 className="text-2xl font-bold text-slate-100">Generate a New Website Idea</h2>
        </div>

        <p className="text-slate-400 mb-6">
          Describe your website idea in a few words, and our AI will generate a title and description.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-2">
              Your Idea
            </label>
            <input
              id="prompt"
              type="text"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="e.g., A social network for pet lovers"
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-md text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all mb-4"
              autoFocus
            />
          </div>

          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-105 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100"
          >
            {isLoading ? (
              <>
                <LoaderIcon />
                Generating...
              </>
            ) : (
              <>
                <SparklesIcon />
                Generate with AI
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
