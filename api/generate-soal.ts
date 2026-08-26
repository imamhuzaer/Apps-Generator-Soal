import { GoogleGenAI } from "@google/genai";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is missing on Vercel/Server. Please set GEMINI_API_KEY in Vercel project settings.");
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

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed. Use POST." });
  }

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
    } = req.body || {};

    if (!mapel || !materi) {
      return res.status(400).json({ error: "Mata pelajaran dan materi wajib diisi." });
    }

    const ai = getGeminiClient();

    let kbcInstruction = "";
    if (kurikulum && (kurikulum.includes("Cinta") || kurikulum.includes("KBC"))) {
      kbcInstruction =
        "PENTING: Gunakan pendekatan Kurikulum Berbasis Cinta (KBC) Kemenag. Selipkan narasi nilai-nilai moderasi beragama, kasih sayang, akhlak mulia, kepedulian sesama, dan pendekatan humanis/spiritual dalam konteks rumusan soal atau studi kasusnya, tanpa mengurangi kedalaman esensi keilmuan utamanya.\n\n";
    }

    const strKognitif =
      Array.isArray(kognitifList) && kognitifList.length > 0
        ? kognitifList.join(", ")
        : "C1, C2, C3, C4";

    const promptText = `Anda adalah pakar penyusun soal ujian nasional dan asesmen kurikulum sekolah Indonesia (Kemendikbudristek & Kemenag).
Buatkan paket soal ujian berkualitas tinggi dan akurat untuk:
- Mata Pelajaran: "${mapel}"
- Materi/Topik: "${materi}"
- Jenjang: "${jenjang || "SMA/SMK"}", Kelas: "${kelas || "Kelas 10"}"
- Kurikulum: "${kurikulum || "Kurikulum Merdeka"}" ${fase ? `(${fase})` : ""}
- Target Level Kognitif Bloom: ${strKognitif}

${kbcInstruction}
Rincian jumlah dan tipe soal yang HARUS dibuat:
- ${numPG || 0} soal Pilihan Ganda (PG) dengan opsi pilihan ${opsiCountPG || "ABCDE"} (A-C, A-D, atau A-E sesuai pengaturan)
- ${numPGK || 0} soal Pilihan Ganda Kompleks (PG Kompleks - dengan lebih dari satu pernyataan/jawaban yang benar)
- ${numMenjodohkan || 0} soal Menjodohkan (berisi pasangan premis/pernyataan dan respon yang relevan)
- ${numEssayS || 0} soal Isian Singkat / Essay Singkat (jawaban pasti/singkat)
- ${numUraian || 0} soal Uraian / Soal Terbuka (memerlukan analisis/penjelasan terstruktur)

Petunjuk Khusus:
1. Jika soal berhubungan dengan rumus matematika, fisika, kimia, atau sains, gunakan format LaTeX yang diapit \\(...\\) untuk inline dan \\[...\\] untuk display.
2. ${
      incImages
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

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "Anda adalah asisten AI spesialis kurikulum dan evaluasi pendidikan Indonesia. Anda menghasilkan JSON murni tanpa markdown wrapper.",
      },
    });

    const rawText = response.text || "";
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/i, "").replace(/```$/i, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/i, "").replace(/```$/i, "").trim();
    }

    const startIdx = cleanJson.indexOf("[");
    const endIdx = cleanJson.lastIndexOf("]");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      cleanJson = cleanJson.substring(startIdx, endIdx + 1);
    }

    const items = JSON.parse(cleanJson);
    if (!Array.isArray(items)) {
      throw new Error("Format output model bukan array JSON.");
    }

    return res.status(200).json({ success: true, items });
  } catch (error: any) {
    console.error("Error in api/generate-soal:", error);
    return res.status(500).json({
      error: error.message || "Gagal menghasilkan soal dari AI",
    });
  }
}
