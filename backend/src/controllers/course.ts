import { Response,Request } from "express";
// Each subject belongs to a specific semester
const course = [
    { id: 1, semesterId: 1, name: "Maths 1" },
    { id: 2, semesterId: 1, name: "Physics 1" },
    { id: 3, semesterId: 2, name: "Maths 2" }
  ];

  export const getCourse = (req: Request, res: Response) => {
    const semesterIdParam = req.query.semesterId;
    if (!semesterIdParam) {
      return res
        .status(400)
        .json({ error: "semesterId query parameter is required" });
    }
    const semesterId = parseInt(semesterIdParam as string, 10);
    if (isNaN(semesterId)) {
      return res.status(400).json({ error: "semesterId must be a number" });
    }
    const result = course.filter((c) => c.semesterId === semesterId);
    return res.json(result);
  };
  export const addCourse = (req: Request, res: Response) => {
    const { name, semesterId } = req.body;
  
    // 1) Validate required fields
    if (!name || !semesterId) {
      return res
        .status(400)
        .json({ error: "Both name and semesterId are required" });
    }
  
    // 2) Build the new course/subject object
    const newCourse = {
      id: course.length + 1,          // simple auto-increment
      semesterId: Number(semesterId),
      name
    };
  
    // 3) Save it in our in-memory list
    course.push(newCourse);
  
    // 4) Return 201 Created with the new object
    return res.status(201).json(newCourse);
  };