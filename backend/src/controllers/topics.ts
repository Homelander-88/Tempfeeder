import { Request, Response } from "express";
import pool from "../db/connection";

export const getTopics = async(req: Request, res: Response) => {
  try{
  const courseIdParam = req.query.courseId;

  if (!courseIdParam) {
    return res
      .status(400)
      .json({ error: "courseId query parameter is required" });
  }

  const courseId = parseInt(courseIdParam as string, 10);
  if (isNaN(courseId)) {
    return res.status(400).json({ error: "courseId must be a number" });
  }

  const result = await pool.query(
    "SELECT id,course_id as \"courseId\",name FROM topics WHERE course_id = $1 ORDER BY id",
    [courseId]
  );
  return res.json(result.rows);
  }catch(err)
  {
    console.error("Error fetching topics:",err);
    res.status(500).json({error:"Internal server error"});
  }
};

// POST /api/topics  body: { "name": "...", "courseId": 1 }
export const addTopic = async(req: Request, res: Response) => {
  try{
  const { name, courseId } = req.body;

  if (!name || !courseId) {
    return res
      .status(400)
      .json({ error: "Both name and courseId are required" });
  }

  const newTopic = await pool.query(
    "INSERT INTO topics (name,course_id) VALUES ($1,$2) RETURNING id,course_id as \"courseId\", name",
    [name,courseId]
  );
  return res.status(201).json(newTopic.rows[0]);
  }
  catch(err)
  {
    console.error("Error adding topics:",err);
    res.status(500).json({error:"Internal server error"});
  }
};