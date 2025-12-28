import api from "./api";

// Get departments by collegeId
export const getDepartments = (collegeId: number) =>
  api.get(`/departments?collegeId=${collegeId}`);

// Create a department
export const createDepartment = (name: string, collegeId: number) =>
  api.post("/departments", { name, collegeId });
