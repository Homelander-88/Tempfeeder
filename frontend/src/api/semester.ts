import api from "./api";

// Get all semesters
export const getSemesters = () => api.get("/semesters");

// Get semesters by departmentId
export const getSemestersByDepartment = (departmentId: number) =>
  api.get(`/semesters?departmentId=${departmentId}`);

// Create a semester
export const createSemester = (name: string, departmentId: number) =>
  api.post("/semesters", { name, departmentId });
