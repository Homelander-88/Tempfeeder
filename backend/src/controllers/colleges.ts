import { Request, Response } from "express";

// Hardcoded data for now – just to test
const colleges = [
  { id: 1, name: "PSG COLLEGE OF TECHNOLOGY" },
];

// Controller function
export const getColleges = (_req: Request, res: Response) => {
  res.json(colleges);
};

export const addCollege = (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "College name is required" });
  }
  const newCollege = {
    id: colleges.length + 1,
    name
  };
  colleges.push(newCollege);
  res.status(201).json(newCollege);
};