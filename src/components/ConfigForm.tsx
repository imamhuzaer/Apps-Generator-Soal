import React from "react";
import { Sliders, ListChecks, FilePlus, Sparkles, Loader2 } from "lucide-react";
import { GeneratorConfig } from "../types";

interface ConfigFormProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ConfigForm: React.FC<ConfigFormProps> = ({
  config,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const handleTextChange = (
    field: keyof GeneratorConfig,
    value: string | number | boolean
  ) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const handleKognitifToggle = (val: string) => {
    const exists = config.kognitifList.includes(val);
    const newList = exists
      ? config.kognitifList.filter((k) => k !== val)
      : [...config.kognitifList, val];
    onChange({
      ...config,
      kognitifList: newList,
    });
  };

  const kognitifOptions = [
    { id: "C1", label: "C1 (Mengingat)" },
    { id: "C2", label: "C2 (Memahami)" },
    { id: "C3", label: "C3 (Menerapkan)" },
    { id: "C4", label: "C4 (Menganalisis)" },
    { id: "C5", label: "C5 (Mengevaluasi)" },
    { id: "C6", label: "C6 (Mencipta)" },
  ];

  return (
    <div className="bg-[#141414] rounded-2xl border border-white/5 overflow-hidden shadow-2xl no-print">
      {/* Header */}
      <div className="h-11 border-b border-white/5 flex items-center px-4 justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="text-[11px] font-bold tracking-widest text-gray-300 uppercase">
            Konfigurasi Parameter
          </span>
        </div>
        <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          PROMPT CONFIG
        </span>
      </div>

      <form onSubmit={onSubmit} className="p-5 space-y-4 text-xs">
        {/* Kurikulum */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Kurikulum
          </label>
          <select
            className="w-full text-xs rounded-lg border border-white/10 px-3 py-2 bg-[#1A1A1A] text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            value={config.kurikulum}
            onChange={(e) => handleTextChange("kurikulum", e.target.value)}
          >
            <option value="Kurikulum Merdeka" className="bg-[#1A1A1A] text-gray-200">
              Kurikulum Merdeka
            </option>
            <option value="Kurikulum 2013" className="bg-[#1A1A1A] text-gray-200">
              Kurikulum 2013
            </option>
            <option
              value="Kurikulum Berbasis Cinta (KBC)"
              className="bg-[#1A1A1A] text-gray-200"
            >
              Kurikulum Berbasis Cinta (KBC) - Kemenag
            </option>
          </select>
        </div>

        {/* Fase Kurikulum Merdeka */}
        {config.kurikulum === "Kurikulum Merdeka" && (
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Fase Kurikulum Merdeka
            </label>
            <select
              className="w-full text-xs rounded-lg border border-white/10 px-3 py-2 bg-[#1A1A1A] text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={config.fase}
              onChange={(e) => handleTextChange("fase", e.target.value)}
            >
              <option value="Fase A (Kelas 1-2 SD)" className="bg-[#1A1A1A] text-gray-200">
                Fase A (Kelas 1-2 SD)
              </option>
              <option value="Fase B (Kelas 3-4 SD)" className="bg-[#1A1A1A] text-gray-200">
                Fase B (Kelas 3-4 SD)
              </option>
              <option value="Fase C (Kelas 5-6 SD)" className="bg-[#1A1A1A] text-gray-200">
                Fase C (Kelas 5-6 SD)
              </option>
              <option value="Fase D (Kelas 7-9 SMP)" className="bg-[#1A1A1A] text-gray-200">
                Fase D (Kelas 7-9 SMP)
              </option>
              <option
                value="Fase E (Kelas 10 SMA/SMK)"
                className="bg-[#1A1A1A] text-gray-200"
              >
                Fase E (Kelas 10 SMA/SMK)
              </option>
              <option
                value="Fase F (Kelas 11-12 SMA/SMK)"
                className="bg-[#1A1A1A] text-gray-200"
              >
                Fase F (Kelas 11-12 SMA/SMK)
              </option>
            </select>
          </div>
        )}

        {/* Mapel */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Mata Pelajaran <span className="text-blue-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Matematika / Fisika / Biologi / PAI"
            className="w-full text-xs rounded-lg border border-white/10 px-3 py-2 bg-[#1A1A1A] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            value={config.mapel}
            onChange={(e) => handleTextChange("mapel", e.target.value)}
          />
        </div>

        {/* Materi */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Materi / Topik Pembahasan <span className="text-blue-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Bilangan Berpangkat & Eksponen"
            className="w-full text-xs rounded-lg border border-white/10 px-3 py-2 bg-[#1A1A1A] text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            value={config.materi}
            onChange={(e) => handleTextChange("materi", e.target.value)}
          />
        </div>

        {/* Level Kognitif */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Level Kognitif Bloom (Pilih &gt;1)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {kognitifOptions.map((cog) => {
              const isChecked = config.kognitifList.includes(cog.label);
              return (
                <label
                  key={cog.id}
                  className={`flex items-center space-x-2 text-[11px] p-2 rounded-lg border cursor-pointer transition-all ${
                    isChecked
                      ? "bg-blue-500/15 border-blue-500/40 text-blue-300 font-medium"
                      : "bg-[#1A1A1A] border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleKognitifToggle(cog.label)}
                    className="rounded border-white/20 bg-[#0F0F0F] text-blue-500 focus:ring-blue-500/30 h-3.5 w-3.5"
                  />
                  <span>{cog.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Jenjang & Kelas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Jenjang
            </label>
            <select
              className="w-full text-xs rounded-lg border border-white/10 px-3 py-2 bg-[#1A1A1A] text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={config.jenjang}
              onChange={(e) => handleTextChange("jenjang", e.target.value)}
            >
              <option value="SD/MI" className="bg-[#1A1A1A] text-gray-200">SD/MI</option>
              <option value="SMP/MTs" className="bg-[#1A1A1A] text-gray-200">SMP/MTs</option>
              <option value="SMA/MA" className="bg-[#1A1A1A] text-gray-200">SMA/MA</option>
              <option value="SMK" className="bg-[#1A1A1A] text-gray-200">SMK</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
              Kelas
            </label>
            <select
              className="w-full text-xs rounded-lg border border-white/10 px-3 py-2 bg-[#1A1A1A] text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              value={config.kelas}
              onChange={(e) => handleTextChange("kelas", e.target.value)}
            >
              <option value="Kelas 1" className="bg-[#1A1A1A] text-gray-200">Kelas 1</option>
              <option value="Kelas 2" className="bg-[#1A1A1A] text-gray-200">Kelas 2</option>
              <option value="Kelas 3" className="bg-[#1A1A1A] text-gray-200">Kelas 3</option>
              <option value="Kelas 4" className="bg-[#1A1A1A] text-gray-200">Kelas 4</option>
              <option value="Kelas 5" className="bg-[#1A1A1A] text-gray-200">Kelas 5</option>
              <option value="Kelas 6" className="bg-[#1A1A1A] text-gray-200">Kelas 6</option>
              <option value="Kelas 7" className="bg-[#1A1A1A] text-gray-200">Kelas 7</option>
              <option value="Kelas 8" className="bg-[#1A1A1A] text-gray-200">Kelas 8</option>
              <option value="Kelas 9" className="bg-[#1A1A1A] text-gray-200">Kelas 9</option>
              <option value="Kelas 10" className="bg-[#1A1A1A] text-gray-200">Kelas 10</option>
              <option value="Kelas 11" className="bg-[#1A1A1A] text-gray-200">Kelas 11</option>
              <option value="Kelas 12" className="bg-[#1A1A1A] text-gray-200">Kelas 12</option>
            </select>
          </div>
        </div>

        {/* Opsi Pilihan PG */}
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
            Opsi Pilihan Ganda
          </label>
          <select
            className="w-full text-xs rounded-lg border border-white/10 px-3 py-2 bg-[#1A1A1A] text-gray-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            value={config.opsiCountPG}
            onChange={(e) =>
              handleTextChange(
                "opsiCountPG",
                e.target.value as "ABC" | "ABCD" | "ABCDE"
              )
            }
          >
            <option value="ABC" className="bg-[#1A1A1A] text-gray-200">3 Opsi (A - C) - SD</option>
            <option value="ABCD" className="bg-[#1A1A1A] text-gray-200">4 Opsi (A - D) - SMP</option>
            <option value="ABCDE" className="bg-[#1A1A1A] text-gray-200">5 Opsi (A - E) - SMA/SMK</option>
          </select>
        </div>

        {/* Jumlah Soal */}
        <div className="pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            <ListChecks className="w-3.5 h-3.5 text-blue-400" />
            <span>Jumlah Butir Soal</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-white/5">
              <span className="text-gray-300 font-medium">Pilihan Ganda (PG)</span>
              <input
                type="number"
                min="0"
                max="20"
                className="w-14 text-center text-xs font-mono font-bold rounded border border-white/10 bg-[#0F0F0F] text-white py-1 px-1 focus:border-blue-500 focus:outline-none"
                value={config.numPG}
                onChange={(e) =>
                  handleTextChange("numPG", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-white/5">
              <span className="text-gray-300 font-medium">PG Kompleks (Multi Jawaban)</span>
              <input
                type="number"
                min="0"
                max="20"
                className="w-14 text-center text-xs font-mono font-bold rounded border border-white/10 bg-[#0F0F0F] text-white py-1 px-1 focus:border-blue-500 focus:outline-none"
                value={config.numPGK}
                onChange={(e) =>
                  handleTextChange("numPGK", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-white/5">
              <span className="text-gray-300 font-medium">Menjodohkan</span>
              <input
                type="number"
                min="0"
                max="20"
                className="w-14 text-center text-xs font-mono font-bold rounded border border-white/10 bg-[#0F0F0F] text-white py-1 px-1 focus:border-blue-500 focus:outline-none"
                value={config.numMenjodohkan}
                onChange={(e) =>
                  handleTextChange("numMenjodohkan", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-white/5">
              <span className="text-gray-300 font-medium">Essay / Isian Singkat</span>
              <input
                type="number"
                min="0"
                max="20"
                className="w-14 text-center text-xs font-mono font-bold rounded border border-white/10 bg-[#0F0F0F] text-white py-1 px-1 focus:border-blue-500 focus:outline-none"
                value={config.numEssayS}
                onChange={(e) =>
                  handleTextChange("numEssayS", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-[#1A1A1A] border border-white/5">
              <span className="text-gray-300 font-medium">Uraian / Soal Terbuka</span>
              <input
                type="number"
                min="0"
                max="20"
                className="w-14 text-center text-xs font-mono font-bold rounded border border-white/10 bg-[#0F0F0F] text-white py-1 px-1 focus:border-blue-500 focus:outline-none"
                value={config.numUraian}
                onChange={(e) =>
                  handleTextChange("numUraian", parseInt(e.target.value) || 0)
                }
              />
            </div>
          </div>
        </div>

        {/* Format Output Tambahan */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            <FilePlus className="w-3.5 h-3.5 text-blue-400" />
            <span>Dokumen Tambahan</span>
          </div>

          <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={config.incKeys}
              onChange={(e) => handleTextChange("incKeys", e.target.checked)}
              className="rounded border-white/20 bg-[#0F0F0F] text-blue-500 focus:ring-blue-500/30"
            />
            <span>Sertakan Kunci Jawaban</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={config.incImages}
              onChange={(e) => handleTextChange("incImages", e.target.checked)}
              className="rounded border-white/20 bg-[#0F0F0F] text-blue-500 focus:ring-blue-500/30"
            />
            <span>Sertakan Diagram / Gambar AI (SVG)</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={config.incKartu}
              onChange={(e) => handleTextChange("incKartu", e.target.checked)}
              className="rounded border-white/20 bg-[#0F0F0F] text-blue-500 focus:ring-blue-500/30"
            />
            <span>Sertakan Kartu Soal Lengkap</span>
          </label>

          <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={config.incRubrik}
              onChange={(e) => handleTextChange("incRubrik", e.target.checked)}
              className="rounded border-white/20 bg-[#0F0F0F] text-blue-500 focus:ring-blue-500/30"
            />
            <span>Sertakan Rubrik Penilaian &amp; Penskoran</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 transition-all text-xs tracking-wider uppercase"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sedang Merumuskan Soal...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-200" />
              <span>Mulai Membuat Soal</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
