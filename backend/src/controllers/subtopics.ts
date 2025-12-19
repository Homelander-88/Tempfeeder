import { Request, Response } from "express";

// In-memory subtopics; each subtopic belongs to a topic (topicId)
const subtopics = [
  { id: 1, topicId: 1, name: "Left-hand & Right-hand Limits" },
  { id: 2, topicId: 1, name: "Limit Laws" },
  { id: 3, topicId: 2, name: "Derivative Definition" }
];

// GET /api/subtopics?topicId=1
export const getSubtopics = (req: Request, res: Response) => {
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

  const result = subtopics.filter((s) => s.topicId === topicId);
  return res.json(result);
};

// POST /api/subtopics  body: { "name": "...", "topicId": 1 }
export const addSubtopic = (req: Request, res: Response) => {
  const { name, topicId } = req.body;

  if (!name || !topicId) {
    return res
      .status(400)
      .json({ error: "Both name and topicId are required" });
  }

  const newSubtopic = {
    id: subtopics.length + 1,
    topicId: Number(topicId),
    name
  };

  subtopics.push(newSubtopic);
  return res.status(201).json(newSubtopic);
};