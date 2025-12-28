import api from "./api";

// Get all colleges (protected)
export const getColleges = () => api.get("/colleges");

// Create a new college
export const createCollege = (name: string) =>
  api.post("/colleges", { name });
