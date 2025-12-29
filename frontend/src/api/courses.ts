import api from "./api";

// Get courses by semesterId
export const getCourses = (semesterId: number) =>
  api.get(`/courses?semesterId=${semesterId}`);

// Get all courses (admin)
export const getAllCourses = () => api.get("/courses");

// Create a new course
export const createCourse = (name: string, semesterId: number) =>
  api.post("/courses", { name, semesterId });
