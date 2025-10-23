import prisma from "../db/prismaClient.js";
import { runEvaluationPipeline } from "../services/jobService.js";

export const evaluateCandidate = async (req, res) => {
  try {
    const { jobTitle, cvId, projectId } = req.body;

    if (!jobTitle || !cvId || !projectId) {
      return res
        .status(400)
        .json({ message: "jobTitle, cvId, and projectId are required." });
    }

    const job = await prisma.evaluation.create({
      data: {
        jobTitle,
        candidateCvId: parseInt(cvId),
        candidateReportId: parseInt(projectId),
        status: "queued",
      },
    });

    // Jalankan pipeline async (non-blocking)
    runEvaluationPipeline(job.id).catch((err) =>
      console.error("Pipeline failed:", err)
    );

    res.status(202).json({
      id: job.id,
      status: "queued",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to start evaluation job",
      error: String(error),
    });
  }
};
