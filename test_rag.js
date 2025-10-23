import { getRelevantContexts } from "./src/services/ragService.js";

const testRAG = async () => {
  console.log("=== 🧩 TESTING RAG UNTUK CV ===");
  const cvContexts = await getRelevantContexts("backend", "cv_context");
  console.log(cvContexts);

  console.log("\n=== 📘 TESTING RAG UNTUK PROJECT ===");
  const projectContexts = await getRelevantContexts("bottle", "project_context");
  console.log(projectContexts ? projectContexts.substring(0, 500) + "..." : "Tidak ada hasil");
};

testRAG();