import { Request,Response } from "express";
// Our in-memory list of semesters. Each semester belongs to a department.
const semesters = [
    { id: 1, departmentId: 1, name: "Sem1" },
    { id: 2, departmentId: 1, name: "Sem2" },
    { id: 3, departmentId: 2, name: "Sem1" }
  ];

  export const getsemesters = (_req:Request,res:Response) =>{
    const departmentIdParam = _req.query.departmentId;
    if(!departmentIdParam){
        return res.status(400).json({ error:"department id parameter is required"});
    }
    const departmentId = parseInt(departmentIdParam as string,10);
    if(isNaN(departmentId)){
        return res.status(400).json({ error:"department id must be a number"});
    }
    const result = semesters.filter((sem) => sem.departmentId === departmentId);
    return res.json(result);
};

export const addSemester = (req: Request, res: Response) => {
    const { name, departmentId } = req.body;
  
    // 1) Validate required fields
    if (!name || !departmentId) {
      return res
        .status(400)
        .json({ error: "Both name and departmentId are required" });
    }
  
    // 2) Build the new semester object
    const newSemester = {
      id: semesters.length + 1,          // simple auto-increment
      departmentId: Number(departmentId),
      name
    };
  
    // 3) Store it in our in-memory array
    semesters.push(newSemester);
  
    // 4) Send back 201 Created with the new object
    return res.status(201).json(newSemester);
  };