import "dotenv/config";
import pool from "./db/connection";
import express from "express";
import cors from "cors";
import {fullRouter} from "./routes/index";
const app = express();
const PORT = process.env.PORT || 5000;

async function testConnection(){
    try{
        const result = await pool.query("SELECT NOW()");
        console.log("Connected to postgres...");
        console.log("Database time:",result.rows[0].now);
    }catch(err){
        console.log("Database connection failed...");
    }
}
testConnection();
// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000', // Alternative dev port
    process.env.FRONTEND_URL || 'https://spoonfeeders.vercel.app', // Alternative Vercel URL
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", fullRouter);
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})