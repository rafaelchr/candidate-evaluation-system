import path from "path";
import prisma from "../db/prismaClient.js";
import { generateEvaluationResult } from "./llmService.js";
import { getRelevantContexts } from "./ragService.js";
import { extractTextFromPdf } from "./pdfService.js";

export const runEvaluationPipeline = async (jobId) => {
  try {
    await prisma.evaluation.update({
      where: { id: jobId },
      data: { status: "processing", startedAt: new Date() },
    });

    const job = await prisma.evaluation.findUnique({
      where: { id: jobId },
      include: { Cv: true, Report: true },
    });

    if (!job?.Cv?.path || !job?.Report?.path) {
      throw new Error(
        "File CV atau Project Report tidak ditemukan di database."
      );
    }

    const cvPath = path.resolve(job.Cv.path);
    const reportPath = path.resolve(job.Report.path);

    const cvContent = await extractTextFromPdf(cvPath);
    const reportContent = await extractTextFromPdf(reportPath);

    console.log("[DEBUG] Extracted CV text length:", cvContent.length);
    console.log("[DEBUG] Extracted Report text length:", reportContent.length);

    if (cvContent.length === 0 || reportContent.length === 0) {
      throw new Error(
        `Gagal mengekstrak teks dari PDF. CV Length: ${cvContent.length}, Report Length: ${reportContent.length}. Pastikan file tidak kosong dan service 'extractTextFromPdf' berfungsi.`
      );
    }

    const cvContexts = await getRelevantContexts(job.jobTitle, "cv_context");
    const projectContexts = await getRelevantContexts(
      job.jobTitle,
      "project_context"
    );

    const finalResult = await generateEvaluationResult(
      cvContent,
      reportContent,
      cvContexts, 
      projectContexts 
    );

    await prisma.evaluation.update({
      where: { id: jobId },
      data: {
        status: "completed",
        finishedAt: new Date(),
        result: {
          cv_match_rate: finalResult.cv_match_rate,
          cv_feedback: finalResult.cv_feedback,
          project_score: finalResult.project_score,
          project_feedback: finalResult.project_feedback,
          overall_summary: finalResult.overall_summary,
        },
      },
    });
  } catch (err) {
    console.error("Error in evaluation pipeline:", err);
    await prisma.evaluation.update({
      where: { id: jobId },
      data: { status: "failed", error: String(err) },
    });
  }
};
