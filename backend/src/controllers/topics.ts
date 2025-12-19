import { Request, Response } from "express";

// In-memory topics; each topic belongs to a course (courseId)
const topics = [
  { id: 1, courseId: 1, name: "Introduction to Limits" },
  { id: 2, courseId: 1, name: "Derivatives Basics" },
  { id: 3, courseId: 2, name: "Kinematics" }
];

// GET /api/topics?courseId=1
export const getTopics = (req: Request, res: Response) => {
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

  const result = topics.filter((t) => t.courseId === courseId);
  return res.json(result);
};

// POST /api/topics  body: { "name": "...", "courseId": 1 }
export const addTopic = (req: Request, res: Response) => {
  const { name, courseId } = req.body;

  if (!name || !courseId) {
    return res
      .status(400)
      .json({ error: "Both name and courseId are required" });
  }

  const newTopic = {
    id: topics.length + 1,
    courseId: Number(courseId),
    name
  };

  topics.push(newTopic);
  return res.status(201).json(newTopic);
};