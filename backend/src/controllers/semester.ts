import { Request,Response } from "express";
import pool from "../db/connection";

  export const getsemesters = async (_req:Request,res:Response) =>{
    try{
    const departmentIdParam = _req.query.departmentId;
    if(!departmentIdParam){
        return res.status(400).json({ error:"department id parameter is required"});
    }

    const departmentId = parseInt(departmentIdParam as string,10);
    if(isNaN(departmentId)){
        return res.status(400).json({ error:"department id must be a number"});
    }

    const result = await pool.query(
      "SELECT id,department_id as \"departmentId\",name FROM semesters WHERE department_id = $1 ORDER BY id",
      [departmentId]
    );
    
    return res.json(result.rows);
  }catch(err)
  {
    console.error("Failed to fetch the semesters",err);
    res.status(500).json({error:"Internal server error"});
  }
};

export const addSemester = async (req: Request, res: Response) => {
  try{
    const { name, departmentId } = req.body;
  
    // Validate required fields
    if (!name || !departmentId) {
      return res
        .status(400)
        .json({ error: "Both name and departmentId are required" });
    }
  
    const newSemester = await pool.query(
      "INSERT INTO semesters (name,department_id) VALUES ($1,$2) RETURNING id, department_id as \"departmentId\", name",
      [name, departmentId]
    );
  
    return res.status(201).json(newSemester.rows[0]);
  }catch(err)
  {
    console.error("Error adding the semesters:",err);
    res.status(500).json({error:"Internal server error"});
  }
};