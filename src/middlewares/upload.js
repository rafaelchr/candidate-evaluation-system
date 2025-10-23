import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}_${uniqueSuffix}${ext}`);
  }
});

export const uploadFields = multer({ storage }).fields([
  { name: "cv", maxCount: 1 },
  { name: "projectReport", maxCount: 1 },
]);
