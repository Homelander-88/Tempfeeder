import { Request, Response } from "express";
import pool from "../db/connection";

// Controller function
export const getColleges = async (_req: Request, res: Response) => {
  try{
    const result = await pool.query("SELECT id,name FROM colleges ORDER BY id");
    res.json(result.rows);
  }catch(err){
    console.error("Error fetching college");
    res.status(500).json({error:"Internal server error"});
  }
};

export const addCollege = async(req: Request, res: Response) => {
  try{
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "College name is required" });
    }

    const result = await pool.query(
      "INSERT INTO colleges (name) VALUES ($1) RETURNING id, name",
      [name]
    );
    res.status(201).json(result.rows[0]);
  }catch(error){
    console.error("Error creating college");
    res.status(500).json({error:"Internal server error"});
  }
};