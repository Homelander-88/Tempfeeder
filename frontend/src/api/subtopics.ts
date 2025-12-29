import api from "./api";

// Get subtopics by topicId
export const getSubtopics = (topicId: number) =>
  api.get(`/subtopics?topicId=${topicId}`);

// Create a new subtopic
export const createSubtopic = (name: string, topicId: number) =>
  api.post("/subtopics", { name, topicId });

// Get subtopic content
export const getSubtopicContent = (subtopicId: number) =>
  api.get(`/subtopics/${subtopicId}/content`);

// Create subtopic content
export const createSubtopicContent = (subtopicId: number, contentData: any) =>
  api.post(`/subtopics/${subtopicId}/content`, contentData);
