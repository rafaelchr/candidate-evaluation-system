import prisma from "../db/prismaClient.js";

export const uploadPdfFiles = async (req, res) => {
  try {
    const cvFile = req.files?.cv?.[0];
    const reportFile = req.files?.projectReport?.[0];
    if (!cvFile || !reportFile) {
      return res.status(400).json({ message: "cv and projectReport required" });
    }

    // Simpan metadata + text ke database
    const savedCv = await prisma.document.create({
      data: {
        type: "CV",
        filename: cvFile.originalname,
        path: cvFile.path,
      }
    });

    const savedReport = await prisma.document.create({
      data: {
        type: "REPORT",
        filename: reportFile.originalname,
        path: reportFile.path,
      }
    });

    res.status(201).json({
      message: "Files uploaded successfully",
      cvId: savedCv.id,
      projectId: savedReport.id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
