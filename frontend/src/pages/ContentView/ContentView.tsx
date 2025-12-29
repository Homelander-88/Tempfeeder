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
  const { selectedSubtopic, hierarchy, selectedCourse, selectedTopic, courses, topics, subtopics, setSelectedCourse, setSelectedTopic, setSelectedSubtopic, loadTopics, loadSubtopics, loadContent, loadCourses, setHierarchy } = useHierarchy();
  const [contentData, setContentData] = useState<any>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  
  // Session-level content cache using sessionStorage
  const getContentFromCache = (subtopicId: string): any | null => {
    try {
      const cacheKey = `content_cache_${subtopicId}`;
      const cached = sessionStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  const setContentInCache = (subtopicId: string, content: any) => {
    try {
      const cacheKey = `content_cache_${subtopicId}`;
      sessionStorage.setItem(cacheKey, JSON.stringify(content));
    } catch (error) {
      console.error('Error writing to cache:', error);
    }
  };

  const notesRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });

  // Ensure hierarchy is loaded from localStorage if context doesn't have it
  useEffect(() => {
    if (!hierarchy) {
      const savedHierarchy = localStorage.getItem('hierarchy');
      if (savedHierarchy) {
        const parsed = JSON.parse(savedHierarchy);
        if (parsed.semester) {
          setHierarchy(parsed);
        }
      }
    }
  }, [hierarchy, setHierarchy]);

  // Ensure courses are loaded when component mounts
  useEffect(() => {
    if (hierarchy && courses.length === 0) {
      setIsLoadingCourses(true);
      loadCourses().finally(() => setIsLoadingCourses(false));
    }
  }, [hierarchy, courses.length, loadCourses]);

  // Courses are loaded automatically in HierarchyContext when hierarchy changes
  // No need for additional loading here

  useEffect(() => {
    // Load content when selectedSubtopic changes
    if (selectedSubtopic) {
      loadContentData();
    } else {
      setContentData(null);
    }
  }, [selectedSubtopic]);

  const loadContentData = async () => {
    if (!selectedSubtopic) return;

    const subtopicId = selectedSubtopic.id.toString();
    
    // Check sessionStorage cache first
    const cachedContent = getContentFromCache(subtopicId);
    if (cachedContent) {
      setContentData(cachedContent);
      return;
    }

    // If not in cache, fetch from API
    try {
      const content = await loadContent(subtopicId);
      if (content && Array.isArray(content) && content.length > 0) {
        // Transform the backend content format to frontend format
        const transformedContent = transformContentData(content);
        // Store in sessionStorage cache
        setContentInCache(subtopicId, transformedContent);
        setContentData(transformedContent);
      } else {
        // Fallback to mock content if no real content exists
        const mockContent = getMockContent();
        setContentInCache(subtopicId, mockContent);
        setContentData(mockContent);
      }
    } catch (error) {
      // On error, use mock content and cache it
      const mockContent = getMockContent();
      setContentInCache(subtopicId, mockContent);
      setContentData(mockContent);
    }
  };

  const transformContentData = (backendContent: any[]) => {
    // Transform backend content array to frontend format
    const contentMap: { [key: string]: any[] } = {
      videos: [],
      driveResources: [],
      notes: [],
      questions: []
    };

    backendContent.forEach(item => {
      // Handle both content_type and contentType (backend may use either)
      const contentType = item.content_type || item.contentType;
      
      switch (contentType) {
        case 'video':
          if (item.content && (item.content.includes('youtube.com') || item.content.includes('youtu.be'))) {
            contentMap.videos.push({
              title: item.title || 'Video Content',
              youtubeUrl: item.content
            });
          }
          break;
        case 'drive':
          contentMap.driveResources.push({
            title: item.title || 'Drive Resource',
            url: item.content
          });
          break;
        case 'notes':
          if (item.content) {
            contentMap.notes.push(item.content);
          }
          break;
        case 'question':
          contentMap.questions.push({
            question: item.title || item.content || 'Question',
            answer: item.metadata?.answer || item.metadata?.Answer || 'Answer not available'
          });
          break;
      }
    });

    return {
      title: selectedSubtopic?.name || 'Content',
      featuredVideo: contentMap.videos[0] || null,
      videos: contentMap.videos,
      driveResources: contentMap.driveResources,
      notes: contentMap.notes.join('\n\n'),
      questions: contentMap.questions
    };
  };

  const getMockContent = () => {
    if (!selectedSubtopic) return null;

    return {
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
      ]
    };
  };

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

  const handleCourseClick = async (course: any) => {
    setSelectedCourse(course);
    setIsLoadingTopics(true);
    try {
      await loadTopics(course.id);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleTopicClick = async (topic: any) => {
    // Clear previous subtopic selection and content
    setSelectedSubtopic(null);
    setContentData(null);
    // Set the new topic and load its subtopics
    setSelectedTopic(topic);
    setIsLoadingSubtopics(true);
    try {
      await loadSubtopics(topic.id);
    } finally {
      setIsLoadingSubtopics(false);
    }
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setContentData(null);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setContentData(null);
  };

  const handleSubtopicClick = async (subtopic: any) => {
    // Set the selected subtopic (this will trigger the useEffect to load content)
    setSelectedSubtopic(subtopic);
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
        mode={
          selectedTopic ? "subtopics" :
          selectedCourse ? "topics" :
          "courses"
        }
        items={
          selectedTopic ? subtopics :
          selectedCourse ? topics :
          courses
        }
        onItemClick={
          selectedTopic ? handleSubtopicClick :
          selectedCourse ? handleTopicClick :
          handleCourseClick
        }
        selectedItemId={
          selectedTopic 
            ? (selectedSubtopic ? selectedSubtopic.id : undefined)
            : selectedCourse 
              ? selectedCourse.id
              : undefined
        }
        onBackClick={
          selectedTopic ? handleBackToTopics :
          selectedCourse ? handleBackToCourses :
          undefined
        }
        topicName={selectedTopic ? selectedTopic.name : undefined}
        courseName={selectedCourse ? selectedCourse.name : undefined}
        isLoading={
          (selectedTopic ? isLoadingSubtopics : 
           selectedCourse ? isLoadingTopics : 
           isLoadingCourses)
        }
      />
      <div className={`content-main ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${selectedSubtopic ? "scroll-enabled" : "scroll-disabled"}`}>
        {contentData && contentData.title && (
          <div className="content-header">
            <h1 className="fade-in">{contentData.title} <span style={{ fontSize: "0.8rem", color: "#888" }}>({mode.toUpperCase()} MODE)</span></h1>
            {hierarchy && selectedCourse && selectedTopic && selectedSubtopic && (
              <div className="content-breadcrumb">
                <span>{hierarchy.college} → {hierarchy.department} → {hierarchy.semester} → {selectedCourse.name} → {selectedTopic.name} → {selectedSubtopic.name}</span>
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
            <h2>Select a Course to Start Learning</h2>
            <p>Choose a course from the sidebar to explore topics and detailed content.</p>
            <div className="placeholder-steps">
              <div className="step">
                <span className="step-number">1</span>
                <span>Select a course from the sidebar</span>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <span>Choose a topic to explore</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span>Select a subtopic for content</span>
              </div>
              <div className="step">
                <span className="step-number">4</span>
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