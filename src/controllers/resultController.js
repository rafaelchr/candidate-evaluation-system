import prisma from "../db/prismaClient.js";

export const resultById = async (req, res) => {
    const jobId = parseInt(req.params.id);

    if (isNaN(jobId)) {
        return res.status(400).json({
            status: "error",
            message: "ID tidak valid.",
        });
    }

    try {
        const job = await prisma.evaluation.findUnique({
            where: { id: jobId },
            select: { 
                id: true,
                status: true,
                result: true,
            },
        });

        if (!job) {
            return res.status(404).json({
                status: "error",
                message: `Job dengan ID ${jobId} tidak ditemukan.`,
            });
        }

        if(job.status == "processing") {
          return res.status(200).json({
            id: job.id,
            status: job.status,
          });
        }

        res.status(200).json({
            status: "success",
            data: job,
        });
        
    } catch (error) {
        console.error("Error di resultById:", error);
        res.status(500).json({
            status: "error",
            message: "Terjadi kesalahan server saat mengambil data evaluation.",
        });
    }
};