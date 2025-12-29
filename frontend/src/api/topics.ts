import api from "./api";

// Get topics by courseId
export const getTopics = (courseId: number) =>
  api.get(`/topics?courseId=${courseId}`);

// Get topics by college/department/semester (for frontend compatibility)
export const getTopicsByHierarchy = (college: string, department: string, semester: string) =>
  api.get('/topics', {
    params: { college, department, semester }
  });

// Create a new topic
export const createTopic = (name: string, courseId: number) =>
  api.post("/topics", { name, courseId });
