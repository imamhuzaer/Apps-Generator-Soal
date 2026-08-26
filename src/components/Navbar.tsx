import React from "react";
import { Sparkles, Terminal, Key } from "lucide-react";

interface NavbarProps {
  onOpenApiKeyModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenApiKeyModal }) => {
  return (
    <header className="no-print bg-[#0F0F0F] border-b border-white/5 text-gray-300 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-600/25">
            <Terminal className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white tracking-tight leading-none">
                Generator Soal AI
              </span>
              <span className="text-[10px] text-blue-400 font-mono tracking-tighter px-1.5 py-0.5 bg-blue-500/10 rounded border border-blue-500/20">
                v2.4-edu
              </span>
            </div>
            <span className="text-[11px] text-gray-500 hidden sm:block mt-0.5">
              Kurikulum Merdeka • K13 • KBC Kemenag
            </span>
          </div>
        </div>

        {/* Right: API Key Config & Author Credit */}
        <div className="flex items-center gap-2.5">
          {onOpenApiKeyModal && (
            <button
              onClick={onOpenApiKeyModal}
              title="Konfigurasi API Key untuk Vercel / GitHub"
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs font-medium rounded-lg border border-white/10 shadow-xs transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[11px] hidden sm:inline">Set API Key</span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-[11px] font-mono text-green-400 font-medium">
              GEMINI 3.7
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] text-gray-300 text-xs font-medium rounded-lg border border-white/10 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px]">desain by imam huzaer</span>
          </div>
        </div>
      </div>
    </header>
  );
};

