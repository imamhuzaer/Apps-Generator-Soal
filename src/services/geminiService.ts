import { GoogleGenAI } from "@google/genai";
import { GeneratorConfig, SoalItem } from "../types";

export function buildGenerateSoalPrompt(config: GeneratorConfig): string {
  let kbcInstruction = "";
  if (config.kurikulum && (config.kurikulum.includes("Cinta") || config.kurikulum.includes("KBC"))) {
    kbcInstruction =
      "PENTING: Gunakan pendekatan Kurikulum Berbasis Cinta (KBC) Kemenag. Selipkan narasi nilai-nilai moderasi beragama, kasih sayang, akhlak mulia, kepedulian sesama, dan pendekatan humanis/spiritual dalam konteks rumusan soal atau studi kasusnya, tanpa mengurangi kedalaman esensi keilmuan utamanya.\n\n";
  }

  const strKognitif =
    Array.isArray(config.kognitifList) && config.kognitifList.length > 0
      ? config.kognitifList.join(", ")
      : "C1, C2, C3, C4";

  return `Anda adalah pakar penyusun soal ujian nasional dan asesmen kurikulum sekolah Indonesia (Kemendikbudristek & Kemenag).
Buatkan paket soal ujian berkualitas tinggi dan akurat untuk:
- Mata Pelajaran: "${config.mapel}"
- Materi/Topik: "${config.materi}"
- Jenjang: "${config.jenjang || "SMA/SMK"}", Kelas: "${config.kelas || "Kelas 10"}"
- Kurikulum: "${config.kurikulum || "Kurikulum Merdeka"}" ${config.fase ? `(${config.fase})` : ""}
- Target Level Kognitif Bloom: ${strKognitif}

${kbcInstruction}Rincian jumlah dan tipe soal yang HARUS dibuat:
- ${config.numPG || 0} soal Pilihan Ganda (PG) dengan opsi pilihan ${config.opsiCountPG || "ABCDE"} (A-C, A-D, atau A-E sesuai pengaturan)
- ${config.numPGK || 0} soal Pilihan Ganda Kompleks (PG Kompleks - dengan lebih dari satu pernyataan/jawaban yang benar)
- ${config.numMenjodohkan || 0} soal Menjodohkan (berisi pasangan premis/pernyataan dan respon yang relevan)
- ${config.numEssayS || 0} soal Isian Singkat / Essay Singkat (jawaban pasti/singkat)
- ${config.numUraian || 0} soal Uraian / Soal Terbuka (memerlukan analisis/penjelasan terstruktur)

Petunjuk Khusus:
1. Jika soal berhubungan dengan rumus matematika, fisika, kimia, atau sains, gunakan format LaTeX yang diapit \\(...\\) untuk inline dan \\[...\\] untuk display.
2. ${
    config.incImages
      ? 'Set field "needsImage": true KHUSUS untuk soal yang benar-benar membutuhkan representasi visual diagram grafis, geometri, skema rangkaian, grafik fungsi, atau bagan konsep. Jika tidak butuh representasi grafis, set false.'
      : 'Set field "needsImage": false.'
  }
3. Pastikan setiap soal memiliki indikator capaian pembelajaran yang jelas, level kognitif (misal C2, C3, C4, C5), kunci jawaban yang presisi dan tidak ambigu, serta rubrik penilaian/penskoran yang terperinci.
4. Pada tipe "Menjodohkan", format "pasanganData" harus berupa baris-baris yang dipisahkan baris baru dengan pemisah tanda pipa "|", contoh:
"Pernyataan 1 | Pasangan Jawaban A\\nPernyataan 2 | Pasangan Jawaban B"

Berikan respon HANYA berupa JSON Array valid dengan skema berikut:
[
  {
    "tipe": "PG" | "PG Kompleks" | "Menjodohkan" | "Essay Singkat" | "Uraian",
    "pertanyaan": "teks rumusan soal lengkap",
    "indikator": "indikator ketercapaian soal",
    "levelKognitif": "C1" | "C2" | "C3" | "C4" | "C5" | "C6",
    "needsImage": true | false,
    "opsiA": "teks pilihan A (kosongkan jika bukan PG/PGK)",
    "opsiB": "teks pilihan B (kosongkan jika bukan PG/PGK)",
    "opsiC": "teks pilihan C (kosongkan jika bukan PG/PGK)",
    "opsiD": "teks pilihan D (jika opsi ABCD/ABCDE)",
    "opsiE": "teks pilihan E (jika opsi ABCDE)",
    "pasanganData": "Pernyataan 1 | Pasangan A\\nPernyataan 2 | Pasangan B (khusus Menjodohkan)",
    "kunciJawaban": "kunci jawaban presisi (misal: 'A. ...' atau pernyataan benar atau nilai)",
    "rubrikPenilaian": "pedoman penskoran dan kriteria pemberian nilai lengkap"
  }
]`;
}

export function buildDiagramPrompt(questionText: string, mapel?: string, materi?: string): string {
  return `Buatkan diagram visual atau sketsa grafis SVG murni berkualitas tinggi dan profesional untuk soal mata pelajaran "${mapel || "Sains/Matematika"}", materi "${materi || "Konsep"}".
Rumusan Soal: "${questionText}"

Ketentuan Output:
1. HANYA berikan kode SVG valid yang diawali persis dengan <svg ...> dan diakhiri dengan </svg>.
2. Jangan sertakan teks penjelasan apapun di luar tag <svg>.
3. Gunakan atribut viewBox="0 0 500 280", background terang yang kontras (#f8fafc), garis yang rapi (#1e293b, #3b82f6, #10b981), font sans-serif yang tajam, dan label angka/huruf yang mudah dibaca.
4. Buat visual yang akurat secara ilmiah / matematis (misal: segitiga siku-siku dengan sudut & sisi yang diberi label, grafik parabola/fungsi koordinat kartesius yang tepat, diagram Venn, rangkaian listrik berseri/paralel, bagan sel/ekosistem, atau tabel perbandingan).`;
}

export function parseSoalJson(rawText: string): SoalItem[] {
  let cleanJson = (rawText || "").trim();
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.replace(/^```json/i, "").replace(/```$/i, "").trim();
  } else if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.replace(/^```/i, "").replace(/```$/i, "").trim();
  }

  // Find array brackets if surrounded by other text
  const startIdx = cleanJson.indexOf("[");
  const endIdx = cleanJson.lastIndexOf("]");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleanJson = cleanJson.substring(startIdx, endIdx + 1);
  }

  const items = JSON.parse(cleanJson);
  if (!Array.isArray(items)) {
    throw new Error("Format output model bukan array JSON.");
  }
  return items;
}

export function parseSvgString(rawText: string): string {
  let rawSvg = (rawText || "")
    .replace(/```xml/gi, "")
    .replace(/```html/gi, "")
    .replace(/```svg/gi, "")
    .replace(/```/g, "")
    .trim();

  const svgMatch = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return svgMatch[0];
  } else if (rawSvg.startsWith("<svg") && rawSvg.endsWith("</svg>")) {
    return rawSvg;
  }
  throw new Error("Gagal membuat kode SVG yang valid.");
}

export function getClientGeminiApiKey(): string | null {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("GEMINI_USER_API_KEY");
    if (saved && saved.trim()) return saved.trim();
  }
  // Vite env variable
  try {
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv?.VITE_GEMINI_API_KEY) {
      return metaEnv.VITE_GEMINI_API_KEY;
    }
  } catch {
    // ignore
  }
  return null;
}

export function setClientGeminiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("GEMINI_USER_API_KEY", key.trim());
    } else {
      localStorage.removeItem("GEMINI_USER_API_KEY");
    }
  }
}

/**
 * Client-side direct generation fallback for static hosting (e.g. Vercel without backend server or GitHub Pages)
 */
export async function generateSoalDirect(config: GeneratorConfig, customApiKey?: string): Promise<SoalItem[]> {
  const apiKey = customApiKey || getClientGeminiApiKey();
  if (!apiKey) {
    throw new Error(
      "API Key Gemini belum diset. Silakan masukkan Gemini API Key di menu 'API Key' atau set GEMINI_API_KEY di environment variable Vercel."
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const prompt = buildGenerateSoalPrompt(config);
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      systemInstruction:
        "Anda adalah asisten AI spesialis kurikulum dan evaluasi pendidikan Indonesia. Anda menghasilkan JSON murni tanpa markdown wrapper.",
    },
  });

  return parseSoalJson(response.text || "");
}

/**
 * Client-side direct diagram generation fallback
 */
export async function generateDiagramDirect(
  questionText: string,
  mapel?: string,
  materi?: string,
  customApiKey?: string
): Promise<string> {
  const apiKey = customApiKey || getClientGeminiApiKey();
  if (!apiKey) {
    throw new Error("API Key Gemini diperlukan untuk membuat diagram visual.");
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  const prompt = buildDiagramPrompt(questionText, mapel, materi);
  const response = await ai.models.generateContent({
    model: "gemini-3.7-flash",
    contents: prompt,
    config: {
      systemInstruction:
        "Anda adalah AI pembuat diagram vektor SVG edukatif. Hasilkan HANYA kode SVG murni tanpa wrapper markdown.",
    },
  });

  return parseSvgString(response.text || "");
}
