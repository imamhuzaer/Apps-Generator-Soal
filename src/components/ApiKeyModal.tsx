import React, { useState, useEffect } from "react";
import { Key, X, Check, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";
import { getClientGeminiApiKey, setClientGeminiApiKey } from "../services/geminiService";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeySaved,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getClientGeminiApiKey() || "";
      setApiKey(current);
      setIsSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setClientGeminiApiKey(apiKey);
    setIsSaved(true);
    if (onKeySaved) onKeySaved();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setClientGeminiApiKey("");
    setApiKey("");
    setIsSaved(true);
    if (onKeySaved) onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-2xl max-w-lg w-full shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-gray-200">
        <div className="bg-[#1A1A1A] px-6 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">
              Pengaturan Gemini API Key
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex gap-3 text-blue-300 leading-relaxed">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Deployment Vercel / GitHub:</strong>
              <p className="mt-1 text-gray-300">
                Jika dideploy ke Vercel, Anda dapat memasukkan API Key di{" "}
                <strong className="text-white">Vercel Settings &gt; Environment Variables</strong>{" "}
                dengan nama <code className="bg-black/40 px-1.5 py-0.5 rounded text-blue-300">GEMINI_API_KEY</code>,
                atau masukkan langsung di bawah ini agar tersimpan di browser Anda.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Google Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full text-xs font-mono rounded-lg border border-white/10 px-3 py-2.5 bg-[#1A1A1A] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <div className="flex justify-between items-center mt-2">
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
              >
                <span>Dapatkan API Key gratis di Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-[11px] text-red-400 hover:text-red-300 transition-colors"
                >
                  Hapus Key
                </button>
              )}
            </div>
          </div>

          {isSaved && (
            <div className="p-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>API Key berhasil disimpan!</span>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-semibold border border-white/10 transition-colors"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition-colors"
            >
              Simpan API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
