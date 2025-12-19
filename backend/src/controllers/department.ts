import { Request,Response } from "express";
const departments = [
    { id: 1, collegeId: 1, name: "Computer Science and Engineering" },
];

// GET: Return all departments for a specific collegeId
export const getDepartments = (_req:Request,res:Response) =>{
    const collegeId = parseInt(_req.query.collegeId as string);
    if(isNaN(collegeId)){
        return res.status(400).json({ error:"college id parameter is required"});
    }
    const result = departments.filter(dept => dept.collegeId == collegeId);
    return res.json(result);
};

// POST: Add a new department to a college
export const addDepartment = (req: Request, res: Response) => {
    const { name, collegeId } = req.body;
    if (!name || !collegeId) {
      return res.status(400).json({ error: "Both name and collegeId are required" });
    }
    const newDept = {
      id: departments.length + 1, // simple auto-increment
      collegeId: Number(collegeId),
      name
    };
    departments.push(newDept);
    res.status(201).json(newDept);
  };