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

const FALLBACK_MODELS = [
  "gemini-3.7-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

async function callGeminiWithResilience(
  ai: GoogleGenAI,
  prompt: string,
  config?: {
    systemInstruction?: string;
  }
) {
  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            ...(config?.systemInstruction ? { systemInstruction: config.systemInstruction } : {}),
          },
        });
        if (response && response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          err?.status === 503 ||
          err?.status === 429 ||
          err?.status === 500 ||
          errMsg.includes("503") ||
          errMsg.includes("429") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("RESOURCE_EXHAUSTED") ||
          errMsg.includes("overloaded");

        if (isTransient && attempt === 0) {
          await new Promise((r) => setTimeout(r, 1500));
          continue;
        }
        break;
      }
    }
  }

  const lastMsg = lastError?.message || String(lastError);
  if (lastMsg.includes("503") || lastMsg.includes("high demand") || lastMsg.includes("UNAVAILABLE")) {
    throw new Error(
      "Server AI sedang mengalami antrean tinggi (503). Sistem telah mencoba model alternatif. Silakan coba klik Generate lagi."
    );
  }
  throw lastError;
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

    const response = await callGeminiWithResilience(ai, promptText, {
      systemInstruction:
        "Anda adalah AI pembuat diagram vektor SVG edukatif. Hasilkan HANYA kode SVG murni tanpa wrapper markdown.",
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
