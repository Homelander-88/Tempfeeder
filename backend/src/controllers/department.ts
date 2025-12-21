import { Request,Response } from "express";
import pool from "../db/connection";

// GET: Return all departments for a specific collegeId
export const getDepartments = async(_req:Request,res:Response) =>{
  try{
    const collegeId = parseInt(_req.query.collegeId as string);
    if(isNaN(collegeId)){
        return res.status(400).json({ error:"college id parameter is required"});
    }
    const result = await pool.query(
      "SELECT id, college_id as \" collegeId\", name FROM departments WHERE college_id = $1 ORDER BY id",
      [collegeId]
    );
    return res.json(result.rows);
  }catch(err)
  {
    console.error("Failed to fetch departments",err);
    res.status(500).json({error:"Internal server error"});
  }
};

// POST: Add a new department to a college
export const addDepartment = async (req: Request, res: Response) => {
  try{
    const { name, collegeId } = req.body;
    if (!name || !collegeId) {
      return res.status(400).json({ error: "Both name and collegeId are required" });
    }
    const newDept = await pool.query(
      "INSERT INTO departments (name, college_id) VALUES ($1, $2) RETURNING id, college_id as \"collegeId\", name",
      [name, collegeId]
    );
  
    res.status(201).json(newDept.rows[0]);
  }catch(err){
    console.error("Failed to add departments ",err);
    res.status(500).json({error:"Internal server error"});
  }
};