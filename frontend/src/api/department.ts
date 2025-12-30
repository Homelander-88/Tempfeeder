import api from "./api";

// Get departments by collegeId or collegeName
export const getDepartments = (collegeId: number) =>
  api.get(`/departments?collegeId=${collegeId}`);

// Get departments by college name
export const getDepartmentsByCollegeName = (collegeName: string) =>
  api.get(`/departments?collegeName=${encodeURIComponent(collegeName)}`);

// Create a department
export const createDepartment = (name: string, collegeId: number) =>
  api.post("/departments", { name, collegeId });

// Delete a department
export const deleteDepartment = (id: number) =>
  api.delete(`/departments/${id}`);