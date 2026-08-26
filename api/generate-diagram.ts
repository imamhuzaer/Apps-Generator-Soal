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
    const { questionText, mapel, materi } = req.body || {};
    if (!questionText) {
      return res.status(400).json({ error: "Teks soal diperlukan untuk membuat diagram." });
    }

    const ai = getGeminiClient();

    const promptText = `Buatkan diagram visual atau sketsa grafis SVG murni berkualitas tinggi dan profesional untuk soal mata pelajaran "${mapel || "Sains/Matematika"}", materi "${materi || "Konsep"}".
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
        systemInstruction:
          "Anda adalah AI pembuat diagram vektor SVG edukatif. Hasilkan HANYA kode SVG murni tanpa wrapper markdown.",
      },
    });

    let rawSvg = (response.text || "")
      .replace(/```xml/gi, "")
      .replace(/```html/gi, "")
      .replace(/```svg/gi, "")
      .replace(/```/g, "")
      .trim();

    const svgMatch = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      rawSvg = svgMatch[0];
    } else if (!rawSvg.startsWith("<svg") || !rawSvg.endsWith("</svg>")) {
      throw new Error("Gagal membuat kode SVG yang valid.");
    }

    return res.status(200).json({ success: true, svg: rawSvg });
  } catch (error: any) {
    console.error("Error in api/generate-diagram:", error);
    return res.status(500).json({
      error: error.message || "Gagal membuat diagram SVG",
    });
  }
}
