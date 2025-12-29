import React, { useState, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useHierarchy } from '../../context/HeirarchyContext';
import './Heirarchy.css';

interface HeirarchyProps {
  onNavigateToLogin: () => void;
  onNavigateToContent: () => void;
}

const Heirarchy: React.FC<HeirarchyProps> = ({ onNavigateToLogin, onNavigateToContent }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { hierarchy, topics, subtopics, selectedTopic, selectedSubtopic, setSelectedTopic, setSelectedSubtopic, loadSubtopics, loadContent } = useHierarchy();
  const [sidebarMode, setSidebarMode] = useState<'topics' | 'subtopics'>('topics');

  // This component is no longer used - users go directly to ContentView
  useEffect(() => {
    // Component disabled
  }, []);

  const handleMenuToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleNavigate = (path: string) => {
    switch (path) {
      case '/login':
        onNavigateToLogin();
        break;
      case '/content':
        onNavigateToContent();
        break;
      default:
        break;
    }
  };

  const handleTopicClick = async (topic: any) => {
    setSelectedTopic(topic);
    setSelectedSubtopic(null);
    await loadSubtopics(topic.id);
    setSidebarMode('subtopics');
  };

  const handleSubtopicClick = async (subtopic: any) => {
    setSelectedSubtopic(subtopic);
    // Load content for the subtopic (this will be used in ContentView)
    await loadContent(subtopic.id);
    // Navigate to content view
    onNavigateToContent();
  };

  const handleBackToTopics = () => {
    setSidebarMode('topics');
    setSelectedTopic(null);
    setSelectedSubtopic(null);
  };

  return (
    <div className="heirarchy-view">
      <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} onLogout={onNavigateToLogin} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        mode={sidebarMode}
        items={sidebarMode === 'topics' ? topics : subtopics}
        onItemClick={sidebarMode === 'topics' ? handleTopicClick : handleSubtopicClick}
        selectedItemId={sidebarMode === 'topics' ? selectedTopic?.id : selectedSubtopic?.id}
      />

      <div className={`heirarchy-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="heirarchy-header">
          <h1>Learning Topics</h1>
          <p>Select a topic to explore subtopics</p>
          {hierarchy && (
            <div className="hierarchy-info">
              <p><strong>College:</strong> {hierarchy.college}</p>
              <p><strong>Department:</strong> {hierarchy.department}</p>
              <p><strong>Semester:</strong> {hierarchy.semester}</p>
            </div>
          )}
        </div>

        <div className="heirarchy-body">
          <div className="heirarchy-card">
            {sidebarMode === 'subtopics' && selectedTopic ? (
              <>
                <h2>{selectedTopic.name}</h2>
                <p>{selectedTopic.description}</p>
                <p>Select a subtopic from the sidebar to view its content.</p>
                <div className="heirarchy-actions">
                  <button onClick={handleBackToTopics}>← Back to Topics</button>
                  <button onClick={onNavigateToLogin}>Back to Login</button>
                </div>
              </>
            ) : (
              <>
                <h2>Select a Topic</h2>
                <p>Choose a topic from the sidebar to explore available subtopics.</p>
                <div className="heirarchy-actions">
                  <button onClick={onNavigateToLogin}>Back to Login</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heirarchy;
