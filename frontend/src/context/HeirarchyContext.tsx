import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/api';

export interface HierarchyData {
  college: string;
  department: string;
  semester: string;
}

export interface Topic {
  id: string;
  name: string;
  label: string; // Add label for compatibility with Sidebar
  description?: string;
}

export interface Subtopic {
  id: string;
  name: string;
  label: string; // Add label for compatibility with Sidebar
  description?: string;
  contentId?: string;
}

interface HierarchyContextType {
  hierarchy: HierarchyData | null;
  selectedTopic: Topic | null;
  selectedSubtopic: Subtopic | null;
  topics: Topic[];
  subtopics: Subtopic[];
  setHierarchy: (hierarchy: HierarchyData) => void;
  setSelectedTopic: (topic: Topic | null) => void;
  setSelectedSubtopic: (subtopic: Subtopic | null) => void;
  loadTopics: () => Promise<void>;
  loadSubtopics: (topicId: string) => Promise<void>;
  loadContent: (subtopicId: string) => Promise<any>;
}

const HierarchyContext = createContext<HierarchyContextType | undefined>(undefined);

export const useHierarchy = () => {
  const context = useContext(HierarchyContext);
  if (context === undefined) {
    throw new Error('useHierarchy must be used within a HierarchyProvider');
  }
  return context;
};

interface HierarchyProviderProps {
  children: ReactNode;
}

export const HierarchyProvider: React.FC<HierarchyProviderProps> = ({ children }) => {
  const [hierarchy, setHierarchy] = useState<HierarchyData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<Subtopic | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  // Load hierarchy from localStorage on mount
  useEffect(() => {
    const savedHierarchy = localStorage.getItem('hierarchy');
    if (savedHierarchy) {
      setHierarchy(JSON.parse(savedHierarchy));
    }
  }, []);

  const loadTopics = async () => {
    if (!hierarchy) return;

    try {
      const response = await api.get('/topics', {
        params: {
          college: hierarchy.college,
          department: hierarchy.department,
          semester: hierarchy.semester
        }
      });
      setTopics(response.data);
    } catch (error) {
      console.error('Failed to load topics:', error);
      // Load topics based on user's college, department, and semester
      // This should be replaced with actual API call
      setTopics([]);
    }
  };

  const loadSubtopics = async (topicId: string) => {
    try {
      const response = await api.get(`/subtopics/${topicId}`);
      setSubtopics(response.data);
    } catch (error) {
      console.error('Failed to load subtopics:', error);
      // For now, set some mock data based on topic
      const mockSubtopics: { [key: string]: Subtopic[] } = {
        // This should be replaced with actual API call
      };
      setSubtopics(mockSubtopics[topicId] || []);
    }
  };

  const loadContent = async (subtopicId: string) => {
    try {
      const response = await api.get(`/subtopicContent/${subtopicId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to load content:', error);
      // Return empty content data - should be replaced with actual API call
      return {
        title: "",
        videos: [],
        driveResources: [],
        notes: "",
        questions: []
      };
    }
  };

  const handleSetHierarchy = (newHierarchy: HierarchyData) => {
    setHierarchy(newHierarchy);
    localStorage.setItem('hierarchy', JSON.stringify(newHierarchy));
  };

  const value: HierarchyContextType = {
    hierarchy,
    selectedTopic,
    selectedSubtopic,
    topics,
    subtopics,
    setHierarchy: handleSetHierarchy,
    setSelectedTopic,
    setSelectedSubtopic,
    loadTopics,
    loadSubtopics,
    loadContent,
  };

  return (
    <HierarchyContext.Provider value={value}>
      {children}
    </HierarchyContext.Provider>
  );
};
