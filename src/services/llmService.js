import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Mendefinisikan struktur JSON output yang diinginkan untuk memastikan model mengikutinya. (SCHEMA TETAP SAMA)
 */
const evaluationSchema = {
  type: Type.OBJECT,
  properties: {
    cv_match_rate: {
      type: Type.NUMBER,
      description:
        "Overall match score for the CV against job requirements, between 0.0 and 1.0.",
    },
    cv_feedback: {
      type: Type.STRING,
      description:
        "Detailed analysis and feedback on the CV, covering skills, experience, and major highlights/concerns.",
    },
    project_score: {
      type: Type.NUMBER,
      description:
        "Overall technical score for the project report, between 1.0 and 5.0.",
    },
    project_feedback: {
      type: Type.STRING,
      description:
        "Detailed analysis and technical feedback on the project's architecture, code quality, and technical decisions.",
    },
    overall_summary: {
      type: Type.STRING,
      description:
        "A concise, final summary of the candidate's overall fit based on both CV and project evaluation.",
    },
  },
  required: [
    "cv_match_rate",
    "cv_feedback",
    "project_score",
    "project_feedback",
    "overall_summary",
  ],
};

/**
 * Melakukan evaluasi CV dan Proyek dalam satu panggilan API.
 * * @param {string} cvContent - Isi dari CV kandidat.
 * @param {string} projectReport - Laporan teknis/proyek kandidat.
 * @param {string} jobContext - Deskripsi pekerjaan (job context) untuk acuan CV.
 * @param {string} projectContext - Deskripsi atau requirement proyek untuk acuan evaluasi proyek.
 * @returns {Promise<object>} Objek JSON lengkap sesuai format yang diinginkan.
 */
export const generateEvaluationResult = async (
  cvContent,
  reportContent,
  cvContexts,
  projectContexts
) => {
  try {
    const combinedPrompt = `
      Anda adalah pakar rekrutmen AI. Tugas Anda adalah melakukan evaluasi menyeluruh terhadap seorang kandidat berdasarkan CV dan Laporan Proyek teknis mereka.
      
      **1. KONTEKS PEKERJAAN (Job Requirement - Acuan CV):**
      ${cvContexts}
      
      **2. KONTEKS PROYEK (Project Requirements - Acuan Laporan):**
      ${projectContexts} 
      
      **3. CV KANDIDAT:**
      ${cvContent}
      
      **4. LAPORAN PROYEK TEKNIS:**
      ${reportContent}
      
      Lakukan analisis terperinci, berikan skor, dan ringkasan akhir. Output harus sesuai dengan struktur JSON yang ditentukan (responseSchema).
      
      **Instruksi Khusus untuk Evaluasi:**
      - **cv_match_rate**: Berikan skor kecocokan CV terhadap konteks pekerjaan dalam rentang 0.0 hingga 1.0.
      - **project_score**: Berikan skor teknis proyek dalam rentang 1.0 hingga 5.0 (boleh menggunakan desimal, cth: 4.5). Evaluasi berdasarkan persyaratan pada bagian KONTEKS PROYEK.
      - **overall_summary**: Rangkum kecocokan kandidat secara keseluruhan (gabungan CV & Proyek) dalam satu paragraf yang ringkas.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: combinedPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: evaluationSchema,
      },
    });

    const jsonText = response.output_text?.trim() || response.text?.trim();

    if (!jsonText) {
      throw new Error("LLM returned empty JSON output.");
    }

    return JSON.parse(jsonText);
  } catch (err) {
    console.error("LLM Error:", err);
    throw new Error(`Failed to generate evaluation result: ${err.message}`);
  }
};
