import dotenv from "dotenv";
import { evaluateWithGemini } from "./src/services/llmService.js";

dotenv.config();

const runTest = async () => {
  console.log("🔍 Testing Gemini LLM Integration...");
  console.log("Gemini API Key detected:", process.env.GEMINI_API_KEY ? "Detected" : "Missing");

  // Contoh teks dummy
  const context = `
    Job Title: Frontend Developer
    Required Skills: React, JavaScript, UI/UX understanding, teamwork.
  `;

  const cvText = `
    I am a software engineer experienced in React, Node.js, and TypeScript.
    I have built multiple web applications and worked in agile teams.
  `;

  const projectText = `
    This project involves creating a responsive web dashboard using React and Tailwind CSS.
    It includes authentication, data visualization, and API integration.
  `;

  // Test CV Evaluation
  const cvResult = await evaluateWithGemini("cv", cvText, context);
  console.log("- CV Evaluation Result:", cvResult);

  // Test Project Evaluation
  const projectResult = await evaluateWithGemini("project", projectText, context);
  console.log("- Project Evaluation Result:", projectResult);

  // Test Summary
  const summary = await evaluateWithGemini(
    "summary",
    `${cvResult.feedback}\n${projectResult.feedback}`,
    context
  );
  console.log("- Final Summary:", summary);
};

runTest().catch((err) => console.error("Test failed:", err));
