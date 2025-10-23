import express from "express";
import dotenv from "dotenv";
import uploadRouter from "./routes/uploadRoutes.js";
import evaluateRouter from "./routes/evaluateRoutes.js";
import resultRouter from "./routes/resultRouter.js";
import path from "path";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(process.cwd(), "public", "uploads")));

app.use("/upload", uploadRouter);
app.use("/evaluate", evaluateRouter);
app.use("/result", resultRouter);

app.get('/', (req, res) => {
  res.send('hello world')
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
