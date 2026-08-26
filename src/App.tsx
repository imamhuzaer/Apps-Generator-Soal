import React, { useState } from "react";
import { Navbar } from "./components/Navbar";
import { ConfigForm } from "./components/ConfigForm";
import { PreviewPaper } from "./components/PreviewPaper";
import { GFormModal } from "./components/GFormModal";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { FooterCredit } from "./components/FooterCredit";
import { GeneratorConfig, SoalItem } from "./types";
import { AlertCircle, CheckCircle2, Key, RefreshCw } from "lucide-react";
import {
  generateSoalDirect,
  generateDiagramDirect,
  getClientGeminiApiKey,
} from "./services/geminiService";

export default function App() {
  const [config, setConfig] = useState<GeneratorConfig>({
    kurikulum: "Kurikulum Merdeka",
    fase: "Fase E (Kelas 10 SMA/SMK)",
    mapel: "Matematika",
    materi: "Bilangan Berpangkat & Eksponen",
    kognitifList: [
      "C1 (Mengingat)",
      "C2 (Memahami)",
      "C3 (Menerapkan)",
      "C4 (Menganalisis)",
    ],
    jenjang: "SMK",
    kelas: "Kelas 10",
    opsiCountPG: "ABCDE",
    numPG: 2,
    numPGK: 1,
    numMenjodohkan: 1,
    numEssayS: 1,
    numUraian: 1,
    incKeys: true,
    incImages: true,
    incKartu: true,
    incRubrik: true,
  });

  const [items, setItems] = useState<SoalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [generatingDiagramIndex, setGeneratingDiagramIndex] = useState<number | null>(null);
  const [isGFormModalOpen, setIsGFormModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const totalQuestions =
      config.numPG +
      config.numPGK +
      config.numMenjodohkan +
      config.numEssayS +
      config.numUraian;

    if (totalQuestions <= 0) {
      setErrorMessage("Pilih minimal 1 jumlah soal yang ingin dibuat.");
      return;
    }

    setIsLoading(true);

    try {
      let generatedItems: SoalItem[] | null = null;
      let usedFallback = false;

      // 1. First attempt: call backend API endpoint (/api/generate-soal)
      try {
        const response = await fetch("/api/generate-soal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        });

        const contentType = response.headers.get("content-type") || "";

        if (response.ok && contentType.includes("application/json")) {
          const data = await response.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            generatedItems = data.items;
          }
        } else if (response.status === 404 || !contentType.includes("application/json")) {
          // Endpoint returned HTML 404 (e.g. Vercel static or GitHub Pages without serverless)
          console.warn("Backend /api/generate-soal unreachable (404/HTML). Switching to direct client Gemini SDK...");
          usedFallback = true;
        } else {
          // Response returned JSON with error status
          const data = await response.json().catch(() => null);
          const errMsg = data?.error || `Server error (HTTP ${response.status})`;
          if (errMsg.includes("GEMINI_API_KEY") || errMsg.includes("missing")) {
            usedFallback = true;
          } else {
            throw new Error(errMsg);
          }
        }
      } catch (fetchErr: any) {
        console.warn("Fetch error, attempting direct Gemini client fallback:", fetchErr);
        usedFallback = true;
      }

      // 2. Second attempt: Direct Client SDK if backend was unreachable or missing server key
      if (!generatedItems && usedFallback) {
        const clientKey = getClientGeminiApiKey();
        if (!clientKey) {
          throw new Error(
            "Backend serverless belum menerima GEMINI_API_KEY. Silakan masukkan Gemini API Key di menu 'Set API Key' di atas, atau tambahkan GEMINI_API_KEY pada Environment Variables Vercel."
          );
        }
        generatedItems = await generateSoalDirect(config, clientKey);
      }

      if (!generatedItems || generatedItems.length === 0) {
        throw new Error("Gagal mendapatkan format soal valid dari AI. Coba lagi.");
      }

      setItems(generatedItems);
      setSuccessMessage(
        `Berhasil menyusun ${generatedItems.length} butir soal lengkap! ${
          usedFallback ? "(Mode Client Direct)" : ""
        }`
      );
    } catch (err: any) {
      console.error("Gagal generate:", err);
      const msg = err.message || "Gagal membuat soal. Pastikan koneksi dan API Key aktif.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDiagram = async (index: number) => {
    const targetItem = items[index];
    if (!targetItem) return;

    setGeneratingDiagramIndex(index);
    try {
      let svgResult: string | null = null;
      let usedFallback = false;

      // 1. Try backend /api/generate-diagram
      try {
        const res = await fetch("/api/generate-diagram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionText: targetItem.pertanyaan,
            mapel: config.mapel,
            materi: config.materi,
          }),
        });

        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.svg) {
            svgResult = data.svg;
          }
        } else {
          usedFallback = true;
        }
      } catch {
        usedFallback = true;
      }

      // 2. Direct fallback
      if (!svgResult && usedFallback) {
        svgResult = await generateDiagramDirect(
          targetItem.pertanyaan,
          config.mapel,
          config.materi
        );
      }

      if (svgResult) {
        const updated = [...items];
        updated[index] = {
          ...updated[index],
          generatedSvg: svgResult,
        };
        setItems(updated);
      } else {
        throw new Error("Tidak dapat membuat diagram SVG.");
      }
    } catch (err: any) {
      alert("Gagal membuat diagram SVG: " + err.message);
    } finally {
      setGeneratingDiagramIndex(null);
    }
  };

  const handleExportWord = () => {
    const content = document.getElementById("wordExportContent");
    if (!content || items.length === 0) {
      alert("Belum ada paket soal yang di-generate!");
      return;
    }

    const cleanMateri = (config.materi || "Soal").replace(/[^a-zA-Z0-9]/g, "_");
    const cleanKelas = (config.kelas || "Kelas").replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `Paket_Soal_${cleanMateri}_${cleanKelas}.doc`;

    const htmlHeader =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export Word Paket Soal</title><style>@page { size: 21cm 29.7cm; margin: 2cm; } body { font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; } table { border-collapse: collapse; width: 100%; margin-top: 10px; margin-bottom: 15px; } td, th { border: 1px solid #000; padding: 6px 8px; vertical-align: top; } th { background-color: #f2f2f2; font-weight: bold; } .page-break { page-break-before: always; mso-break-type: page-break; clear: both; } .no-print { display: none !important; }</style></head><body>";
    const htmlFooter = "</body></html>";
    const sourceHTML = htmlHeader + content.innerHTML + htmlFooter;

    const source =
      "data:application/vnd.ms-word;charset=utf-8," +
      encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = fileName;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] font-sans text-gray-300">
      <Navbar onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors text-[11px]"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Set API Key</span>
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 text-green-300 rounded-xl text-xs flex items-center gap-2.5 shadow-lg">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <div className="font-medium">{successMessage}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Configuration */}
          <div className="lg:col-span-4">
            <ConfigForm
              config={config}
              onChange={setConfig}
              onSubmit={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Output Paper Preview */}
          <div className="lg:col-span-8">
            <PreviewPaper
              items={items}
              config={config}
              onGenerateDiagram={handleGenerateDiagram}
              generatingDiagramIndex={generatingDiagramIndex}
              onOpenGForm={() => setIsGFormModalOpen(true)}
              onExportWord={handleExportWord}
            />
          </div>
        </div>
      </main>

      <FooterCredit />

      <GFormModal
        isOpen={isGFormModalOpen}
        onClose={() => setIsGFormModalOpen(false)}
        items={items}
        mapel={config.mapel}
        materi={config.materi}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={() => {
          setErrorMessage(null);
          setSuccessMessage("API Key berhasil disimpan di browser Anda!");
        }}
      />
    </div>
  );
}

