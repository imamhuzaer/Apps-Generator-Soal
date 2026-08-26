import React, { useState } from "react";
import { X, Copy, Check, Info, FileSpreadsheet } from "lucide-react";
import { SoalItem } from "../types";

interface GFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SoalItem[];
  mapel: string;
  materi: string;
}

export const GFormModal: React.FC<GFormModalProps> = ({
  isOpen,
  onClose,
  items,
  mapel,
  materi,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const listPG = items.filter((q) => q.tipe === "PG");
  const listEssayS = items.filter((q) => q.tipe === "Essay Singkat");

  const cleanStr = (str?: string) => {
    if (!str) return "";
    return str
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "\\'")
      .replace(/\n/g, "\\n");
  };

  let scriptCode = `function createQuizForm() {\n`;
  scriptCode += `  var formTitle = 'Lembar Ujian: ${cleanStr(mapel)} - ${cleanStr(materi)}';\n`;
  scriptCode += `  var form = FormApp.create(formTitle);\n`;
  scriptCode += `  form.setIsQuiz(true);\n`;
  scriptCode += `  form.setProgressBar(true);\n\n`;

  scriptCode += `  // --- SECTION 1: IDENTITAS PESERTA ---\n`;
  scriptCode += `  form.setTitle(formTitle);\n`;
  scriptCode += `  form.setDescription('Pastikan mengisi identitas dengan benar sebelum mengerjakan soal evaluasi.');\n`;
  scriptCode += `  form.addTextItem().setTitle('Nama Lengkap').setRequired(true);\n`;
  scriptCode += `  form.addTextItem().setTitle('Nomor Absen').setRequired(true);\n`;
  scriptCode += `  form.addTextItem().setTitle('Kelas').setRequired(true);\n\n`;

  scriptCode += `  // --- SECTION 2: SOAL EVALUASI ---\n`;
  scriptCode += `  form.addPageBreakItem().setTitle('Pengerjaan Soal').setHelpText('Pilihlah jawaban yang paling tepat. Skor akan dihitung otomatis.');\n\n`;

  // Loop PG
  listPG.forEach((q, idx) => {
    const qText = cleanStr(q.pertanyaan);
    const ansChar = (q.kunciJawaban || "A").trim().toUpperCase().charAt(0);

    scriptCode += `  // Soal PG ${idx + 1}\n`;
    scriptCode += `  var pg${idx} = form.addMultipleChoiceItem();\n`;
    scriptCode += `  pg${idx}.setTitle('${qText}').setRequired(true).setPoints(10);\n`;
    scriptCode += `  var choices${idx} = [];\n`;

    if (q.opsiA)
      scriptCode += `  choices${idx}.push(pg${idx}.createChoice('${cleanStr(q.opsiA)}', ${ansChar === "A"}));\n`;
    if (q.opsiB)
      scriptCode += `  choices${idx}.push(pg${idx}.createChoice('${cleanStr(q.opsiB)}', ${ansChar === "B"}));\n`;
    if (q.opsiC)
      scriptCode += `  choices${idx}.push(pg${idx}.createChoice('${cleanStr(q.opsiC)}', ${ansChar === "C"}));\n`;
    if (q.opsiD)
      scriptCode += `  choices${idx}.push(pg${idx}.createChoice('${cleanStr(q.opsiD)}', ${ansChar === "D"}));\n`;
    if (q.opsiE)
      scriptCode += `  choices${idx}.push(pg${idx}.createChoice('${cleanStr(q.opsiE)}', ${ansChar === "E"}));\n`;

    scriptCode += `  pg${idx}.setChoices(choices${idx});\n\n`;
  });

  // Loop Essay
  listEssayS.forEach((q, idx) => {
    const qText = cleanStr(q.pertanyaan);
    scriptCode += `  // Soal Isian Singkat ${idx + 1}\n`;
    scriptCode += `  var es${idx} = form.addTextItem();\n`;
    scriptCode += `  es${idx}.setTitle('${qText}').setRequired(true).setPoints(10);\n\n`;
  });

  scriptCode += `  // --- SECTION SUBMIT ---\n`;
  scriptCode += `  form.setConfirmationMessage('Terima kasih, lembar jawaban Anda telah tersimpan dengan aman.');\n\n`;
  scriptCode += `  Logger.log('====================================');\n`;
  scriptCode += `  Logger.log('SUKSES! Google Form Berhasil Dibuat.');\n`;
  scriptCode += `  Logger.log('Link Edit Form: ' + form.getEditUrl());\n`;
  scriptCode += `  Logger.log('Link Untuk Siswa: ' + form.getPublishedUrl());\n`;
  scriptCode += `}\n`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-2xl max-w-2xl w-full shadow-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-gray-200">
        <div className="bg-[#1A1A1A] text-gray-200 px-6 py-4 flex items-center justify-between font-bold border-b border-white/10">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Export ke Google Form (Apps Script)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-gray-300">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex gap-3 text-blue-300 leading-relaxed">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>Informasi:</strong> Export otomatis Google Form mendukung
              tipe <strong>Pilihan Ganda (PG)</strong> dan{" "}
              <strong>Isian/Essay Singkat</strong> lengkap dengan kunci penilaian
              kuesioner.
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-200 mb-1.5 uppercase text-[10px] tracking-wider">
              Panduan Cepat Penggunaan:
            </h4>
            <ol className="list-decimal list-inside text-xs space-y-1.5 text-gray-400">
              <li>
                Buka tab baru lalu akses{" "}
                <a
                  href="https://script.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-400 underline"
                >
                  script.google.com
                </a>{" "}
                dan klik <strong>&quot;Project Baru&quot;</strong>.
              </li>
              <li>
                Hapus teks bawaan, lalu <strong>Paste / Tempel</strong> kode
                script di bawah ini.
              </li>
              <li>
                Klik tombol <strong>Save</strong> (Simpan), lalu klik tombol{" "}
                <strong>Run</strong> (Jalankan).
              </li>
              <li>
                Beri otorisasi (Review Permissions -&gt; Allow). Google Form akan
                otomatis terbuat di Google Drive Anda!
              </li>
            </ol>
          </div>

          <div className="relative">
            <pre className="bg-[#0A0A0A] border border-white/10 text-blue-300 p-4 rounded-xl text-xs font-mono max-h-60 overflow-y-auto leading-relaxed">
              {scriptCode}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-blue-600/20 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Script</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#1A1A1A] px-6 py-3.5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg text-xs font-semibold border border-white/10 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
