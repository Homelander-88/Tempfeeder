import express from "express";
import cors from "cors";
import {fullRouter} from "./routes/index";
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use("/api", fullRouter);
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})