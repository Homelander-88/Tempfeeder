import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useHierarchy } from "../../context/HeirarchyContext";
import "./ContentView.css";

interface Video { title: string; youtubeUrl: string };
interface Question { question: string; answer: string };
interface DriveResource { title?: string; url: string };

interface ContentViewProps {
  onNavigateToLogin: () => void;
  onNavigateToHeirarchy: () => void;
}

const ContentView: React.FC<ContentViewProps> = ({ onNavigateToLogin, onNavigateToHeirarchy }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({});
  const [mode, setMode] = useState<"deep" | "normal" | "rush">("normal"); // initial mode
  const { selectedSubtopic, hierarchy, selectedTopic, topics, subtopics, setSelectedTopic, setSelectedSubtopic, loadTopics, loadSubtopics, loadContent } = useHierarchy();
  const [contentData, setContentData] = useState<any>(null);

  const notesRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Load topics when component mounts or hierarchy changes
    if (hierarchy) {
      loadTopics();
    }
  }, [hierarchy, loadTopics]);

  useEffect(() => {
    // Load content when component mounts (content should already be loaded when navigating here)
    if (selectedSubtopic) {
      // For now, set mock content based on subtopic
      const mockContent = {
        title: selectedSubtopic.name,
        featuredVideo: {
          title: `Introduction to ${selectedSubtopic.name}`,
          youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        },
        videos: [
          {
            title: `Tutorial: ${selectedSubtopic.name} Basics`,
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          },
          {
            title: `Advanced ${selectedSubtopic.name} Concepts`,
            youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          }
        ],
        driveResources: [
          {
            title: "Study Materials & Notes",
            url: "https://drive.google.com/file/d/example/preview"
          },
          {
            title: "Practice Problems",
            url: "https://drive.google.com/file/d/example/preview"
          }
        ],
        notes: `Detailed notes for ${selectedSubtopic.name}. This section contains comprehensive information about the topic, including key concepts, definitions, and important points to remember.`,
        questions: [
          {
            question: `What are the fundamental concepts of ${selectedSubtopic.name}?`,
            answer: "The fundamental concepts include basic definitions, core principles, and essential terminology that form the foundation of this topic."
          },
          {
            question: `How does ${selectedSubtopic.name} relate to ${selectedTopic?.name}?`,
            answer: `${selectedSubtopic.name} is a specific subtopic within ${selectedTopic?.name} that focuses on particular aspects and applications of the broader subject area.`
          },
          {
            question: "What are the common challenges when learning this topic?",
            answer: "Common challenges include understanding complex relationships, applying concepts to real-world scenarios, and mastering practical implementation techniques."
          }
        ]
      };
      setContentData(mockContent);
    }
  }, [selectedSubtopic, selectedTopic]);

  const handleMenuToggle = () => setSidebarCollapsed(!sidebarCollapsed);

  // Add keyboard shortcut for sidebar toggle (Ctrl+Z)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  const handleNavigate = (path: string) => {
    if (path === "/login") onNavigateToLogin();
    if (path === "/heirarchy") onNavigateToHeirarchy();
  };

  const handleTopicClick = async (topic: any) => {
    setSelectedTopic(topic);
    await loadSubtopics(topic.id);
  };

  const handleSubtopicClick = async (subtopic: any) => {
    setSelectedSubtopic(subtopic);
    // Load content for the selected subtopic
    await loadContent(subtopic.id);
  };

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : "";
  };

  const handlePlayVideo = (id: string) => setPlayingVideos({ ...playingVideos, [id]: true });

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.JSX.Element[] = [];
    let key = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        elements.push(<h1 key={key++} className="notes-h1">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={key++} className="notes-h2">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={key++} className="notes-h3">{line.substring(4)}</h3>);
      } else if (line.startsWith('1. ')) {
        // Handle numbered lists
        const listItems: React.JSX.Element[] = [];
        let j = i;
        while (j < lines.length && (lines[j].match(/^\d+\. /) || lines[j].trim() === '')) {
          if (lines[j].match(/^\d+\. /)) {
            listItems.push(<li key={key++}>{lines[j].replace(/^\d+\. /, '')}</li>);
          }
          j++;
        }
        elements.push(<ol key={key++} className="notes-list">{listItems}</ol>);
        i = j - 1;
      } else if (line.trim() === '') {
        // Skip empty lines
        continue;
      } else if (line.trim()) {
        elements.push(<p key={key++} className="notes-paragraph">{line}</p>);
      }
    }

    return elements;
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") { setShowToolbar(false); return; }
    const range = selection.getRangeAt(0);
    if (notesRef.current && !notesRef.current.contains(range.commonAncestorContainer)) { setShowToolbar(false); return; }
    const rect = range.getBoundingClientRect();
    setToolbarPos({ x: rect.left + rect.width / 2, y: rect.top - 40 });
    setShowToolbar(true);
  };

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (range.commonAncestorContainer.parentElement?.tagName === "MARK") { setShowToolbar(false); return; }
    const mark = document.createElement("mark");
    mark.className = "user-highlight";
    range.surroundContents(mark);
    selection.removeAllRanges();
    setShowToolbar(false);
  };

  const removeHighlight = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === "MARK") {
      const parent = target.parentNode!;
      while (target.firstChild) parent.insertBefore(target.firstChild, target);
      parent.removeChild(target);
    }
  };

  const sectionsOrder = () => {
    // For demo: YouTube videos first, then Google Drive resources, then notes, then questions
    return ["featuredVideo","videos","driveResources","notes","questions"];
  };

  const renderSection = (section: string) => {
    switch (section) {
      case "featuredVideo":
        if (!contentData.featuredVideo) return null;
        return (
          <section className="section" key="featuredVideo">
            <h2 className="section-title fade-in delay-2">Featured Video</h2>
            <div className="video-card compact">
              <p className="video-title">{contentData.featuredVideo.title}</p>
              <div className="video-wrapper small hover-zoom">
                {playingVideos["featured"] ? (
                  <iframe 
                    src={`https://www.youtube.com/embed/${getYoutubeId(contentData.featuredVideo.youtubeUrl)}?autoplay=1&rel=0&modestbranding=1&showinfo=0`} 
                    allow="autoplay; encrypted-media" 
                    allowFullScreen 
                  />
                ) : (
                  <div className="video-placeholder" onClick={() => handlePlayVideo("featured")}>
                    <div className="play-icon">▶</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      case "videos":
        if (!contentData.videos.length) return null;
        return (
          <section className="section" key="videos">
            <h2 className="section-title fade-in delay-3">Videos</h2>
            <div className="video-list">
              {contentData.videos.map((video: Video, index: number) => {
                const id = `video-${index}`;
                return (
                  <div className="video-card compact" key={index}>
                    <p className="video-title">{video.title}</p>
                    <div className="video-wrapper small hover-zoom">
                      {playingVideos[id] ? (
                        <iframe 
                          src={`https://www.youtube.com/embed/${getYoutubeId(video.youtubeUrl)}?autoplay=1&rel=0&modestbranding=1&showinfo=0`} 
                          allow="autoplay; encrypted-media" 
                          allowFullScreen 
                        />
                      ) : (
                        <div className="video-placeholder" onClick={() => handlePlayVideo(id)}>
                          <div className="play-icon">▶</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      case "driveResources":
        if (!contentData.driveResources.length) return null;
        return (
          <section className="section" key="driveResources">
            <h2 className="section-title fade-in delay-4">Presentation & Resources</h2>
            <div className="drive-resources-container">
              {contentData.driveResources.map((res: DriveResource, index: number) => (
                <div className="resource-item" key={index}>
                  <h3 className="resource-title">{res.title}</h3>
                  <div className="resource-frame-wrapper hover-zoom">
                    <iframe
                      className="resource-frame"
                      src={res.url}
                      allow="autoplay"
                      title={res.title}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      case "notes":
        if (!contentData.notes || contentData.notes.trim() === "") return null;
        return (
          <section className="section notes" key="notes">
            <h2 className="section-title fade-in delay-5">Understanding the Concept</h2>
            <div className="notes-container" ref={notesRef} onMouseUp={handleSelection} onClick={removeHighlight}>
              {renderMarkdown(contentData.notes)}
            </div>
            {showToolbar && <div className="highlight-toolbar" style={{ left: toolbarPos.x, top: toolbarPos.y }}><button onClick={applyHighlight}>Highlight</button></div>}
          </section>
        );
      case "questions":
        if (!contentData.questions.length) return null;
        return (
          <section className="section" key="questions">
            <h2 className="section-title fade-in delay-6">Practice Questions</h2>
            <div className="questions-widget">
              <div className="widget-header">
                <span className="widget-icon">❓</span>
                <span className="widget-title">Test Your Understanding</span>
              </div>
              <div className="qa-widget-list">
                {contentData.questions.map((q: Question, index: number) => (
                  <div className="qa-widget-item" key={index}>
                    <details className="qa-widget-details">
                      <summary className="qa-widget-question">
                        <span className="question-number">{index + 1}.</span>
                        <span className="question-text">{q.question}</span>
                        <span className="dropdown-arrow">▼</span>
                      </summary>
                      <div className="qa-widget-answer">
                        <div className="answer-content">{q.answer}</div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      default: return null;
    }
  };

  return (
    <div className="content-view login-style">
      <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} onModeChange={setMode} />
      <Sidebar
        isCollapsed={sidebarCollapsed}
        mode={selectedTopic ? "subtopics" : "topics"}
        items={selectedTopic ? subtopics : topics}
        onItemClick={selectedTopic ? handleSubtopicClick : handleTopicClick}
        selectedItemId={selectedTopic ? (selectedSubtopic ? selectedSubtopic.id : selectedTopic.id) : undefined}
      />
      <div className={`content-main ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${selectedSubtopic ? "scroll-enabled" : "scroll-disabled"}`}>
        {contentData && contentData.title && (
          <div className="content-header">
            <h1 className="fade-in">{contentData.title} <span style={{ fontSize: "0.8rem", color: "#888" }}>({mode.toUpperCase()} MODE)</span></h1>
            {hierarchy && selectedTopic && selectedSubtopic && (
              <div className="content-breadcrumb">
                <span>{hierarchy.college} → {hierarchy.department} → {hierarchy.semester} → {selectedTopic.name} → {selectedSubtopic.name}</span>
              </div>
            )}
          </div>
        )}
        {!contentData && selectedSubtopic && (
          <div className="content-loading">
            <h2>Loading content...</h2>
            <p>Please wait while we load your learning materials.</p>
          </div>
        )}
        {!selectedSubtopic && (
          <div className="content-placeholder">
            <div className="placeholder-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2>Select a Topic to Start Learning</h2>
            <p>Choose a topic from the sidebar to explore detailed content, videos, and practice questions.</p>
            <div className="placeholder-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span>Select a topic from the sidebar</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span>Choose a subtopic to dive deeper</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span>Access videos, notes, and practice questions</span>
              </div>
            </div>
          </div>
        )}
        {contentData && sectionsOrder().map((section) => renderSection(section))}
      </div>
    </div>
  );
};

export default ContentView;