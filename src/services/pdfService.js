import fs from "fs/promises"; 
import pdf from "pdf-parse"; 
import path from "path";

/**
 * Mengekstrak konten teks mentah dari file PDF menggunakan pdf-parse (pdfjs-dist).
 * Ini lebih andal untuk PDF modern.
 * @param {string} filePath - Path absolut ke file PDF.
 * @returns {Promise<string>} Konten teks yang diekstrak.
 */
export const extractTextFromPdf = async (filePath) => {
  // Pastikan path sudah diresolve untuk kompatibilitas absolut
  const normalizedPath = path.resolve(filePath); 

  console.log(`[PDF-PARSE] Attempting to load file: ${normalizedPath}`);

  try {
    // 1. Baca file ke dalam Buffer
    const dataBuffer = await fs.readFile(normalizedPath);

    // 2. Parse PDF dari Buffer
    const data = await pdf(dataBuffer);

    const text = data.text.trim();

    if (text.length === 0) {
      console.warn(
        "[PDF-PARSE_WARN] Extraction succeeded, but returned empty content. (Possible scanned PDF without OCR or corrupted file)."
      );
    } else {
      console.log(`[PDF-PARSE_SUCCESS] Extracted ${text.length} characters.`);
    }

    return text;
  } catch (err) {
    console.error("[PDF-PARSE_ERROR] Failed during file read or parsing:", err);
    
    // Memberikan error yang lebih spesifik
    if (err.code === "ENOENT") {
      throw new Error(`File not found at path: ${normalizedPath}. Please check database path storage.`);
    }
    // Jika error lain (parsing, memori, dll)
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
};