import { ChromaClient } from "chromadb";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import fs from "fs";
import path from "path";

const chroma = new ChromaClient({
  host: "localhost",
  port: 8000,
  ssl: false,
});

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 100,
});

const ingestFolder = async (folderPath, collectionName) => {
  if (!fs.existsSync(folderPath)) {
    console.warn(`[RAG] Folder ${folderPath} tidak ditemukan.`);
    return;
  }

  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".pdf") || f.endsWith(".json"));
  if (files.length === 0) {
    console.warn(`[RAG] Tidak ada file ditemukan di ${folderPath}.`);
    return;
  }

  const collection = await chroma.getOrCreateCollection({ name: collectionName });

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    let text = fs.readFileSync(filePath, "utf8");

    if (file.endsWith(".json")) {
      text = JSON.stringify(JSON.parse(text), null, 2);
    }

    const chunks = await textSplitter.splitText(text);
    await collection.add({
      ids: chunks.map((_, i) => `${collectionName}-${file}-${i}-${Date.now()}`),
      documents: chunks,
      metadatas: chunks.map(() => ({ source: file })),
    });

    console.log(`[RAG] Stored ${chunks.length} chunks in collection "${collectionName}" from file "${file}"`);
  }
};

export const ingestAllSystemDocuments = async () => {
  await clearAllCollections();

  await ingestFolder("public/jobdesc", "cv_context");
  await ingestFolder("public/cv_rubric", "cv_context");

  await ingestFolder("public/casestudy", "project_context");
  await ingestFolder("public/project_rubric", "project_context");

  console.log("✅ Semua dokumen internal telah di-ingest ke ChromaDB.");
};

export const getRelevantContexts = async (query, targetCollection = "documents") => {
  try {
    const collection = await chroma.getOrCreateCollection({
      name: targetCollection,
    });

    const results = await collection.query({
      queryTexts: [query],
      nResults: 10,
    });

    const contexts = results.documents?.[0] || [];

    if (!contexts.length) {
      console.warn(`[RAG] Tidak ada context relevan ditemukan di "${targetCollection}".`);
      return "";
    }

    console.log(`[RAG] Retrieved ${contexts.length} chunks from "${targetCollection}"`);
    return contexts.join("\n");

  } catch (err) {
    console.error(`[RAG] Error saat mengambil contexts dari "${targetCollection}":`, err.message);
    return "";
  }
};

export const clearAllCollections = async () => {
  try {
    const collections = await chroma.listCollections();

    if (!collections.length) {
      console.log("[RAG] Tidak ada collection untuk dihapus.");
      return;
    }

    for (const col of collections) {
      await chroma.deleteCollection({ name: col.name });
      console.log(`[RAG] Deleted collection "${col.name}"`);
    }

    console.log("✅ Semua collection telah dihapus dari ChromaDB.");
  } catch (err) {
    console.error("[RAG] Gagal menghapus collection:", err.message);
  }
};

export const checkCollections = async () => {
  const collections = await chroma.listCollections();
  console.log("📦 Koleksi yang tersedia:", collections.map(c => c.name));

  for (const col of collections) {
    const collection = await chroma.getCollection({ name: col.name });
    const count = await collection.count();
    console.log(`📚 "${col.name}" berisi ${count} dokumen`);
  }
};
