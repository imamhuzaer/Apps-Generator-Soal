import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy/Safe Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API: Generate Paket Soal
app.post("/api/generate-soal", async (req, res) => {
  try {
    const {
      mapel,
      materi,
      kurikulum,
      fase,
      jenjang,
      kelas,
      opsiCountPG,
      kognitifList,
      numPG,
      numPGK,
      numMenjodohkan,
      numEssayS,
      numUraian,
      incImages,
    } = req.body;

    if (!mapel || !materi) {
      return res.status(400).json({ error: "Mata pelajaran dan materi wajib diisi." });
    }

    const ai = getGeminiClient();

    let kbcInstruction = "";
    if (kurikulum && (kurikulum.includes("Cinta") || kurikulum.includes("KBC"))) {
      kbcInstruction = "PENTING: Gunakan pendekatan Kurikulum Berbasis Cinta (KBC) Kemenag. Selipkan narasi nilai-nilai moderasi beragama, kasih sayang, akhlak mulia, kepedulian sesama, dan pendekatan humanis/spiritual dalam konteks rumusan soal atau studi kasusnya, tanpa mengurangi kedalaman esensi keilmuan utamanya.\n\n";
    }

    const strKognitif = Array.isArray(kognitifList) && kognitifList.length > 0
      ? kognitifList.join(", ")
      : "C1, C2, C3, C4";

    const promptText = `Anda adalah pakar penyusun soal ujian nasional dan asesmen kurikulum sekolah Indonesia (Kemendikbudristek & Kemenag).
Buatkan paket soal ujian berkualitas tinggi dan akurat untuk:
- Mata Pelajaran: "${mapel}"
- Materi/Topik: "${materi}"
- Jenjang: "${jenjang || 'SMA/SMK'}", Kelas: "${kelas || 'Kelas 10'}"
- Kurikulum: "${kurikulum || 'Kurikulum Merdeka'}" ${fase ? `(${fase})` : ''}
- Target Level Kognitif Bloom: ${strKognitif}

${kbcInstruction}
Rincian jumlah dan tipe soal yang HARUS dibuat:
- ${numPG || 0} soal Pilihan Ganda (PG) dengan opsi pilihan ${opsiCountPG || 'ABCDE'} (A-C, A-D, atau A-E sesuai pengaturan)
- ${numPGK || 0} soal Pilihan Ganda Kompleks (PG Kompleks - dengan lebih dari satu pernyataan/jawaban yang benar)
- ${numMenjodohkan || 0} soal Menjodohkan (berisi pasangan premis/pernyataan dan respon yang relevan)
- ${numEssayS || 0} soal Isian Singkat / Essay Singkat (jawaban pasti/singkat)
- ${numUraian || 0} soal Uraian / Soal Terbuka (memerlukan analisis/penjelasan terstruktur)

Petunjuk Khusus:
1. Jika soal berhubungan dengan rumus matematika, fisika, kimia, atau sains, gunakan format LaTeX yang diapit \\(...\\) untuk inline dan \\[...\\] untuk display.
2. ${incImages ? 'Set field "needsImage": true KHUSUS untuk soal yang benar-benar membutuhkan representasi visual diagram grafis, geometri, skema rangkaian, grafik fungsi, atau bagan konsep. Jika tidak butuh representasi grafis, set false.' : 'Set field "needsImage": false.'}
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Anda adalah asisten AI spesialis kurikulum dan evaluasi pendidikan Indonesia. Anda menghasilkan JSON murni tanpa markdown wrapper.",
      },
    });

    const rawText = response.text || "";
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/i, "").replace(/```$/i, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/i, "").replace(/```$/i, "").trim();
    }

    const items = JSON.parse(cleanJson);
    if (!Array.isArray(items)) {
      throw new Error("Format output model bukan array JSON.");
    }

    return res.json({ success: true, items });
  } catch (error: any) {
    console.error("Error generate-soal:", error);
    return res.status(500).json({
      error: error.message || "Gagal menghasilkan soal dari AI",
    });
  }
});

// API: Generate Diagram SVG
app.post("/api/generate-diagram", async (req, res) => {
  try {
    const { questionText, mapel, materi } = req.body;
    if (!questionText) {
      return res.status(400).json({ error: "Teks soal diperlukan untuk membuat diagram." });
    }

    const ai = getGeminiClient();

    const promptText = `Buatkan diagram visual atau sketsa grafis SVG murni berkualitas tinggi dan profesional untuk soal mata pelajaran "${mapel || 'Sains/Matematika'}", materi "${materi || 'Konsep'}".
Rumusan Soal: "${questionText}"

Ketentuan Output:
1. HANYA berikan kode SVG valid yang diawali persis dengan <svg ...> dan diakhiri dengan </svg>.
2. Jangan sertakan teks penjelasan apapun di luar tag <svg>.
3. Gunakan atribut viewBox="0 0 500 280", background terang yang kontras (#f8fafc), garis yang rapi (#1e293b, #3b82f6, #10b981), font sans-serif yang tajam, dan label angka/huruf yang mudah dibaca.
4. Buat visual yang akurat secara ilmiah / matematis (misal: segitiga siku-siku dengan sudut & sisi yang diberi label, grafik parabola/fungsi koordinat kartesius yang tepat, diagram Venn, rangkaian listrik berseri/paralel, bagan sel/ekosistem, atau tabel perbandingan).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        systemInstruction: "Anda adalah AI pembuat diagram vektor SVG edukatif. Hasilkan HANYA kode SVG murni tanpa wrapper markdown.",
      },
    });

    let rawSvg = response.text || "";
    rawSvg = rawSvg.replace(/```xml/gi, "").replace(/```html/gi, "").replace(/```svg/gi, "").replace(/```/g, "").trim();

    const svgMatch = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      rawSvg = svgMatch[0];
    } else if (!rawSvg.startsWith("<svg")) {
      throw new Error("Gagal membuat kode SVG yang valid.");
    }

    return res.json({ success: true, svg: rawSvg });
  } catch (error: any) {
    console.error("Error generate-diagram:", error);
    return res.status(500).json({
      error: error.message || "Gagal membuat diagram SVG",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
