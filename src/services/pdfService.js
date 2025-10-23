import fs from "fs/promises"; 
import pdf from "pdf-parse"; 
import path from "path";

export const extractTextFromPdf = async (filePath) => {
  // Pastikan path sudah diresolve untuk kompatibilitas absolut
  const normalizedPath = path.resolve(filePath); 

  console.log(`[PDF-PARSE] Attempting to load file: ${normalizedPath}`);

  try {
    const dataBuffer = await fs.readFile(normalizedPath);

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
    
    if (err.code === "ENOENT") {
      throw new Error(`File not found at path: ${normalizedPath}. Please check database path storage.`);
    }
    throw new Error(`Failed to extract text from PDF: ${err.message}`);
  }
};