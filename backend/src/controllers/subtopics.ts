import { Request, Response } from "express";
import pool from "../db/connection";

export const getSubtopics = async(req: Request, res: Response) => {
  try{
  const topicIdParam = req.query.topicId;

  if (!topicIdParam) {
    return res
      .status(400)
      .json({ error: "topicId query parameter is required" });
  }

  const topicId = parseInt(topicIdParam as string, 10);
  if (isNaN(topicId)) {
    return res.status(400).json({ error: "topicId must be a number" });
  }

  const result = await pool.query(
    "SELECT id,topic_id as \"topicId\",name FROM subtopics WHERE topic_id = $1 ORDER BY id",
    [topicId]
  );
  return res.json(result.rows);
  }catch(err)
  {
    console.error("Error fetching subtopics:",err);
    res.status(500).json({error:"Internal server error"});
  }
};

// POST /api/subtopics  body: { "name": "...", "topicId": 1 }
export const addSubtopic = async(req: Request, res: Response) => {
  try{
  const { name, topicId } = req.body;

  if (!name || !topicId) {
    return res
      .status(400)
      .json({ error: "Both name and topicId are required" });
  }
  const newSubtopic = await pool.query(
    "INSERT INTO subtopics (name,topic_id) VALUES ($1,$2) RETURNING id,topic_id as \"topicId\", name",
    [name,topicId]
  );
  return res.status(201).json(newSubtopic.rows[0]);
  }catch(err)
  {
    console.error("Error adding subtopics:",err);
    res.status(500).json({error:"Internal server error"});
  }
};