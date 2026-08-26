import React, { useEffect } from "react";
import {
  Printer,
  FileText,
  FileSpreadsheet,
  Wand2,
  Image as ImageIcon,
  RotateCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { GeneratorConfig, SoalItem } from "../types";

declare global {
  interface Window {
    MathJax?: {
      typesetPromise?: () => Promise<void>;
    };
  }
}

interface PreviewPaperProps {
  items: SoalItem[];
  config: GeneratorConfig;
  onGenerateDiagram: (index: number) => void;
  generatingDiagramIndex: number | null;
  onOpenGForm: () => void;
  onExportWord: () => void;
}

export const PreviewPaper: React.FC<PreviewPaperProps> = ({
  items,
  config,
  onGenerateDiagram,
  generatingDiagramIndex,
  onOpenGForm,
  onExportWord,
}) => {
  // Re-run MathJax typesetting whenever items update
  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) =>
        console.error("MathJax typesetting error:", err)
      );
    }
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="bg-[#141414] rounded-2xl shadow-2xl border border-white/5 p-12 text-center text-gray-400">
        <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-gray-100 mb-1">
          Siap Merumuskan Paket Soal
        </h3>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Tentukan mata pelajaran, materi, jenjang, kurikulum, serta jumlah soal
          pada formulir di sebelah kiri, kemudian klik{" "}
          <strong className="text-blue-400">
            &quot;Mulai Membuat Soal&quot;
          </strong>
          .
        </p>
      </div>
    );
  }

  // Filter items by type
  const listPG = items.filter((q) => q.tipe === "PG");
  const listPGK = items.filter((q) => q.tipe === "PG Kompleks");
  const listMenjodohkan = items.filter((q) => q.tipe === "Menjodohkan");
  const listEssayS = items.filter((q) => q.tipe === "Essay Singkat");
  const listUraian = items.filter((q) => q.tipe === "Uraian");

  // Track overall question numbers
  let currentNum = 1;
  const itemNumbersMap = new Map<SoalItem, number>();
  items.forEach((it) => {
    itemNumbersMap.set(it, currentNum++);
  });

  const headerMeta = [
    config.kurikulum,
    config.kurikulum === "Kurikulum Merdeka" && config.fase ? config.fase : null,
    config.jenjang,
    config.kelas,
    config.materi ? `Materi: ${config.materi}` : null,
  ].filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Top Action Toolbar */}
      <div className="no-print bg-[#141414] p-3.5 rounded-2xl border border-white/5 shadow-2xl flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Lembar Soal ({items.length} Soal Tergenerate)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-[#1A1A1A] hover:bg-white/10 text-gray-200 text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-gray-400" />
            <span>Cetak / PDF</span>
          </button>

          <button
            onClick={onExportWord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold shadow-xs transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export to Word</span>
          </button>

          <button
            onClick={onOpenGForm}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export G-Form</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Paper */}
      <div
        id="wordExportContent"
        className="bg-[#141414] rounded-2xl shadow-2xl border border-white/5 p-6 sm:p-10 font-sans text-gray-200 text-sm leading-relaxed print-area"
      >
        {/* KOP SOAL */}
        <div className="text-center pb-4 mb-6 border-b-2 border-white/20">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white m-0">
            LEMBAR SOAL EVALUASI
          </h2>
          <h3 className="text-base sm:text-lg font-bold uppercase tracking-wide text-gray-300 mt-1">
            MATA PELAJARAN: {config.mapel}
          </h3>
          <div className="text-xs text-gray-400 font-medium mt-1.5">
            {headerMeta.join(" | ")}
          </div>
        </div>

        {/* I. PILIHAN GANDA */}
        {listPG.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 bg-white/5 border border-white/10 p-2.5 rounded-lg mb-3">
              I. PILIHAN GANDA
            </h4>
            <div className="space-y-4 pl-1">
              {listPG.map((q) => {
                const qNum = itemNumbersMap.get(q) || 1;
                const origIndex = items.indexOf(q);
                return (
                  <div key={origIndex} className="soal-item space-y-2">
                    <div className="flex gap-2">
                      <span className="font-bold shrink-0 text-white">{qNum}.</span>
                      <div className="flex-1 font-normal text-gray-200">
                        {q.pertanyaan}
                      </div>
                    </div>

                    {/* Diagram Box */}
                    {renderDiagramBox(
                      q,
                      origIndex,
                      generatingDiagramIndex === origIndex,
                      onGenerateDiagram,
                      config.incImages
                    )}

                    {/* Options */}
                    <div className="pl-6 space-y-1 text-gray-300">
                      <div>A. {q.opsiA || "-"}</div>
                      <div>B. {q.opsiB || "-"}</div>
                      <div>C. {q.opsiC || "-"}</div>
                      {(config.opsiCountPG === "ABCD" ||
                        config.opsiCountPG === "ABCDE") && (
                        <div>D. {q.opsiD || "-"}</div>
                      )}
                      {config.opsiCountPG === "ABCDE" && (
                        <div>E. {q.opsiE || "-"}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* II. PILIHAN GANDA KOMPLEKS */}
        {listPGK.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 bg-white/5 border border-white/10 p-2.5 rounded-lg mb-3">
              II. PILIHAN GANDA KOMPLEKS (Pilihlah lebih dari satu jawaban benar)
            </h4>
            <div className="space-y-4 pl-1">
              {listPGK.map((q) => {
                const qNum = itemNumbersMap.get(q) || 1;
                const origIndex = items.indexOf(q);
                return (
                  <div key={origIndex} className="soal-item space-y-2">
                    <div className="flex gap-2">
                      <span className="font-bold shrink-0 text-white">{qNum}.</span>
                      <div className="flex-1 text-gray-200">{q.pertanyaan}</div>
                    </div>

                    {renderDiagramBox(
                      q,
                      origIndex,
                      generatingDiagramIndex === origIndex,
                      onGenerateDiagram,
                      config.incImages
                    )}

                    <div className="pl-6 space-y-1 text-gray-300">
                      <div>[&nbsp; &nbsp;] A. {q.opsiA || "-"}</div>
                      <div>[&nbsp; &nbsp;] B. {q.opsiB || "-"}</div>
                      <div>[&nbsp; &nbsp;] C. {q.opsiC || "-"}</div>
                      {(config.opsiCountPG === "ABCD" ||
                        config.opsiCountPG === "ABCDE") && (
                        <div>[&nbsp; &nbsp;] D. {q.opsiD || "-"}</div>
                      )}
                      {config.opsiCountPG === "ABCDE" && (
                        <div>[&nbsp; &nbsp;] E. {q.opsiE || "-"}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* III. MENJODOHKAN */}
        {listMenjodohkan.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 bg-white/5 border border-white/10 p-2.5 rounded-lg mb-3">
              III. MENJODOHKAN (Pasangkan pernyataan yang sesuai)
            </h4>
            <div className="space-y-4 pl-1">
              {listMenjodohkan.map((q) => {
                const qNum = itemNumbersMap.get(q) || 1;
                const origIndex = items.indexOf(q);
                const pairs = (q.pasanganData || "")
                  .split("\n")
                  .filter((p) => p.trim().length > 0);

                return (
                  <div key={origIndex} className="soal-item space-y-2">
                    <div className="flex gap-2">
                      <span className="font-bold shrink-0 text-white">{qNum}.</span>
                      <div className="flex-1 text-gray-200">{q.pertanyaan}</div>
                    </div>

                    {renderDiagramBox(
                      q,
                      origIndex,
                      generatingDiagramIndex === origIndex,
                      onGenerateDiagram,
                      config.incImages
                    )}

                    <div className="pl-6 overflow-x-auto">
                      <table className="w-full border-collapse border border-white/15 text-xs my-2">
                        <thead>
                          <tr className="bg-[#1A1A1A] font-bold text-gray-300">
                            <th className="border border-white/15 p-2 text-left w-1/2">
                              Pernyataan / Premis
                            </th>
                            <th className="border border-white/15 p-2 text-left w-1/2">
                              Pilihan Pasangan
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {pairs.map((p, pIdx) => {
                            const [left, right] = p.split("|");
                            return (
                              <tr key={pIdx}>
                                <td className="border border-white/15 p-2 text-gray-300">
                                  {pIdx + 1}. {left ? left.trim() : "-"}
                                </td>
                                <td className="border border-white/15 p-2 text-gray-300">
                                  [&nbsp; &nbsp;] {right ? right.trim() : "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* IV. ESSAY SINGKAT */}
        {listEssayS.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 bg-white/5 border border-white/10 p-2.5 rounded-lg mb-3">
              IV. ISIAN / ESSAY SINGKAT
            </h4>
            <div className="space-y-4 pl-1">
              {listEssayS.map((q) => {
                const qNum = itemNumbersMap.get(q) || 1;
                const origIndex = items.indexOf(q);
                return (
                  <div key={origIndex} className="soal-item space-y-2">
                    <div className="flex gap-2">
                      <span className="font-bold shrink-0 text-white">{qNum}.</span>
                      <div className="flex-1 text-gray-200">{q.pertanyaan}</div>
                    </div>

                    {renderDiagramBox(
                      q,
                      origIndex,
                      generatingDiagramIndex === origIndex,
                      onGenerateDiagram,
                      config.incImages
                    )}

                    <div className="pl-6 pt-2">
                      <div className="border-b border-dashed border-white/20 w-3/4 h-6 text-xs text-gray-500">
                        Jawaban:{" "}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* V. URAIAN */}
        {listUraian.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300 bg-white/5 border border-white/10 p-2.5 rounded-lg mb-3">
              V. URAIAN / SOAL TERBUKA
            </h4>
            <div className="space-y-4 pl-1">
              {listUraian.map((q) => {
                const qNum = itemNumbersMap.get(q) || 1;
                const origIndex = items.indexOf(q);
                return (
                  <div key={origIndex} className="soal-item space-y-2">
                    <div className="flex gap-2">
                      <span className="font-bold shrink-0 text-white">{qNum}.</span>
                      <div className="flex-1 text-gray-200">{q.pertanyaan}</div>
                    </div>

                    {renderDiagramBox(
                      q,
                      origIndex,
                      generatingDiagramIndex === origIndex,
                      onGenerateDiagram,
                      config.incImages
                    )}

                    <div className="pl-6 pt-2">
                      <div className="border border-dashed border-white/15 rounded-xl p-3 min-h-[60px] text-xs text-gray-500 bg-[#1A1A1A]/40">
                        Lembar Jawaban Uraian...
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* KUNCI JAWABAN (PAGE BREAK) */}
        {config.incKeys && (
          <div className="page-break pt-8 mt-10 border-t-2 border-white/20">
            <h3 className="text-center font-bold text-base uppercase tracking-wider text-white mb-4">
              KUNCI JAWABAN
            </h3>
            <table className="w-full border-collapse border border-white/15 text-xs">
              <thead>
                <tr className="bg-[#1A1A1A] font-bold text-gray-300">
                  <th className="border border-white/15 p-2 text-center w-16">
                    No
                  </th>
                  <th className="border border-white/15 p-2 text-left w-32">
                    Tipe Soal
                  </th>
                  <th className="border border-white/15 p-2 text-left">
                    Kunci Jawaban / Kriteria Ketepatan
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((q) => {
                  const qNum = itemNumbersMap.get(q) || 1;
                  return (
                    <tr key={qNum}>
                      <td className="border border-white/15 p-2 text-center font-bold text-white">
                        {qNum}
                      </td>
                      <td className="border border-white/15 p-2 font-medium text-gray-300">
                        {q.tipe}
                      </td>
                      <td className="border border-white/15 p-2 font-semibold text-blue-300 font-mono">
                        {q.kunciJawaban || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* KARTU SOAL (PAGE BREAK) */}
        {config.incKartu && (
          <div className="page-break pt-8 mt-10 border-t-2 border-white/20">
            <h3 className="text-center font-bold text-base uppercase tracking-wider text-white mb-4">
              KARTU SOAL
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-white/15 text-xs">
                <thead>
                  <tr className="bg-[#1A1A1A] font-bold text-gray-300">
                    <th className="border border-white/15 p-2 text-center w-12">
                      No
                    </th>
                    <th className="border border-white/15 p-2 text-left w-28">
                      Bentuk / Level
                    </th>
                    <th className="border border-white/15 p-2 text-left w-48">
                      Indikator Soal
                    </th>
                    <th className="border border-white/15 p-2 text-left">
                      Rumusan Soal
                    </th>
                    <th className="border border-white/15 p-2 text-left w-36">
                      Kunci Jawaban
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((q) => {
                    const qNum = itemNumbersMap.get(q) || 1;
                    return (
                      <tr key={qNum}>
                        <td className="border border-white/15 p-2 text-center font-bold text-white">
                          {qNum}
                        </td>
                        <td className="border border-white/15 p-2">
                          <span className="font-semibold text-gray-200">{q.tipe}</span>
                          <div className="text-[11px] text-gray-400">
                            ({q.levelKognitif || "C2"})
                          </div>
                        </td>
                        <td className="border border-white/15 p-2 text-gray-300">
                          {q.indikator || "-"}
                        </td>
                        <td className="border border-white/15 p-2 text-gray-200">
                          {q.pertanyaan}
                        </td>
                        <td className="border border-white/15 p-2 font-bold text-blue-300 font-mono">
                          {q.kunciJawaban || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RUBRIK PENILAIAN (PAGE BREAK) */}
        {config.incRubrik && (
          <div className="page-break pt-8 mt-10 border-t-2 border-white/20">
            <h3 className="text-center font-bold text-base uppercase tracking-wider text-white mb-4">
              RUBRIK PENILAIAN &amp; PEDOMAN PENSKORAN
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-white/15 text-xs">
                <thead>
                  <tr className="bg-[#1A1A1A] font-bold text-gray-300">
                    <th className="border border-white/15 p-2 text-center w-12">
                      No
                    </th>
                    <th className="border border-white/15 p-2 text-left w-28">
                      Bentuk Soal
                    </th>
                    <th className="border border-white/15 p-2 text-left">
                      Kriteria Jawaban / Indikator Skor
                    </th>
                    <th className="border border-white/15 p-2 text-center w-20">
                      Skor Maks
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((q) => {
                    const qNum = itemNumbersMap.get(q) || 1;
                    const maxScore =
                      q.tipe === "Uraian"
                        ? 4
                        : q.tipe === "PG Kompleks"
                        ? 3
                        : 1;
                    return (
                      <tr key={qNum}>
                        <td className="border border-white/15 p-2 text-center font-bold text-white">
                          {qNum}
                        </td>
                        <td className="border border-white/15 p-2 font-medium text-gray-300">
                          {q.tipe}
                        </td>
                        <td className="border border-white/15 p-2 text-gray-300">
                          {q.rubrikPenilaian ||
                            "Jawaban tepat mendapatkan skor penuh, salah skor 0."}
                        </td>
                        <td className="border border-white/15 p-2 text-center font-bold text-blue-300">
                          {maxScore}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function renderDiagramBox(
  q: SoalItem,
  index: number,
  isGenerating: boolean,
  onGenerate: (idx: number) => void,
  allowImages: boolean
) {
  if (!allowImages && !q.generatedSvg) return null;
  if (!q.needsImage && !q.generatedSvg) return null;

  return (
    <div className="my-2 p-3 bg-[#1A1A1A] border border-dashed border-white/15 rounded-xl text-center">
      {q.generatedSvg ? (
        <div className="space-y-2">
          <div
            className="flex justify-center max-h-64 overflow-hidden p-2 rounded bg-white"
            dangerouslySetInnerHTML={{ __html: q.generatedSvg }}
          />
          <div className="no-print flex items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              Diagram Siap
            </span>
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => onGenerate(index)}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 bg-[#0F0F0F] border border-white/10 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              <RotateCw
                className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`}
              />
              <span>{isGenerating ? "Membuat..." : "Regenerate Gambar"}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="no-print space-y-2 py-2">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <ImageIcon className="w-3.5 h-3.5 text-gray-500" />
            <span>Soal ini direkomendasikan memiliki diagram visual / sketsa.</span>
          </div>
          <button
            type="button"
            disabled={isGenerating}
            onClick={() => onGenerate(index)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Sedang Merancang Diagram SVG...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Generate Gambar AI (Diagram SVG)</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
