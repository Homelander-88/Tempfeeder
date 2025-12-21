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
app.use(cors());
app.use(express.json());
app.use("/api", fullRouter);
app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})