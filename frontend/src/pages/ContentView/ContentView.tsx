import React, { useState, useRef, useEffect } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useHierarchy } from "../../context/HeirarchyContext";
import { useAuth } from "../../context/AuthContext";
import { getColleges, createCollege } from "../../api/colleges";
import { getDepartments, createDepartment } from "../../api/department";
import { createSemester, getSemestersByNames } from "../../api/semester";
import { createCourse, deleteCourse } from "../../api/courses";
import { createTopic, deleteTopic } from "../../api/topics";
import { createSubtopic, deleteSubtopic, createSubtopicContent, getSubtopicContent, deleteSubtopicContent } from "../../api/subtopics";
import "./ContentView.css";


interface ContentViewProps {
  onNavigateToLogin: () => void;
  onNavigateToHeirarchy: () => void;
}

const ContentView: React.FC<ContentViewProps> = ({ onNavigateToLogin, onNavigateToHeirarchy }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({});
  const [mode, setMode] = useState<"deep" | "normal" | "rush">("normal"); // initial mode
  const { selectedSubtopic, hierarchy, selectedCourse, selectedTopic, courses, topics, subtopics, setSelectedCourse, setSelectedTopic, setSelectedSubtopic, loadTopics, loadSubtopics, loadContent, loadCourses, setHierarchy, clearTopicCache, clearSubtopicCache } = useHierarchy();

  // Debug logging for topics state
  console.log('ContentView render - topics:', topics, 'selectedCourse:', selectedCourse);

  // Debug when topics change
  useEffect(() => {
    console.log('ContentView - topics changed:', topics);
  }, [topics]);
  const { isAdmin } = useAuth();
  const [contentData, setContentData] = useState<any>(null);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());

  // Admin state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminMode, setAdminMode] = useState<'colleges' | 'departments' | 'semesters'>('colleges');
  const [showAddForm, setShowAddForm] = useState<{ mode: string; visible: boolean }>({ mode: '', visible: false });
  const [addFormData, setAddFormData] = useState({
    name: '',
    courseId: '',
    topicId: ''
  });
  const [showContentAddForm, setShowContentAddForm] = useState<{ section: string; visible: boolean }>({ section: '', visible: false });
  const [contentAddFormData, setContentAddFormData] = useState({
    contentType: 'notes',
    title: '',
    content: ''
  });
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    collegeId: '',
    departmentId: ''
  });
  const [adminColleges, setAdminColleges] = useState<any[]>([]);
  const [adminDepartments, setAdminDepartments] = useState<any[]>([]);


  // Admin functions
  const handleAddItem = (mode: string) => {
    setShowAddForm({ mode, visible: true });
    setAddFormData({ name: '', courseId: '', topicId: '' });
  };

  const handleAddSubmit = async () => {
    try {
      let result;
      switch (showAddForm.mode) {
        case 'courses':
          // For courses, we need to find the semester ID based on the current hierarchy
          if (!hierarchy) return;
          const semesterResponse = await getSemestersByNames(hierarchy.department, hierarchy.college);
          const semester = semesterResponse.data.find((sem: any) => sem.name === hierarchy.semester);
          if (!semester) return;
          result = await createCourse(addFormData.name, semester.id);
          // Refresh courses
          if (hierarchy) {
            loadCourses();
          }
          break;
        case 'topics':
          if (!selectedCourse) {
            console.error('No course selected for topic creation');
            return;
          }
          console.log('Creating topic:', addFormData.name, 'for course:', selectedCourse.id);
          result = await createTopic(addFormData.name, parseInt(selectedCourse.id));
          console.log('Topic created:', result);
          // Clear cache and refresh topics
          clearTopicCache(selectedCourse.id);
          await loadTopics(selectedCourse.id);
          console.log('Topics refreshed after creation');
          break;
        case 'subtopics':
          if (!selectedTopic) return;
          result = await createSubtopic(addFormData.name, parseInt(selectedTopic.id));
          // Clear cache and refresh subtopics
          clearSubtopicCache(selectedTopic.id);
          loadSubtopics(selectedTopic.id);
          break;
      }
      console.log('Added:', result);
      setShowAddForm({ mode: '', visible: false });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (item: any) => {
    try {
      const mode = selectedCourse ? (selectedTopic ? 'subtopics' : 'topics') : 'courses';
      let result;

      switch (mode) {
        case 'courses':
          result = await deleteCourse(item.id);
          // Refresh courses
          if (hierarchy) {
            loadCourses();
          }
          break;
        case 'topics':
          result = await deleteTopic(item.id);
          // Clear cache and refresh topics
          if (selectedCourse) {
            clearTopicCache(selectedCourse.id);
            loadTopics(selectedCourse.id);
          }
          break;
        case 'subtopics':
          result = await deleteSubtopic(item.id);
          // Clear cache and refresh subtopics
          if (selectedTopic) {
            clearSubtopicCache(selectedTopic.id);
            loadSubtopics(selectedTopic.id);
          }
          break;
      }

      console.log('Item deleted:', result);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleAdminSubmit = async () => {
    try {
      let result;
      switch (adminMode) {
        case 'colleges':
          result = await createCollege(adminFormData.name);
          break;
        case 'departments':
          result = await createDepartment(adminFormData.name, parseInt(adminFormData.collegeId));
          break;
        case 'semesters':
          result = await createSemester(adminFormData.name, parseInt(adminFormData.departmentId));
          break;
      }
      console.log('Created:', result);
      // Reset form
      setAdminFormData({
        name: '',
        collegeId: '',
        departmentId: ''
      });
    } catch (error) {
      console.error('Error creating entity:', error);
    }
  };

  
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

  // Load admin data when admin panel opens
  useEffect(() => {
    if (showAdminPanel && isAdmin) {
      loadAdminColleges();
    }
  }, [showAdminPanel, isAdmin]);

  // Load departments when college is selected
  useEffect(() => {
    if (adminFormData.collegeId && showAdminPanel) {
      loadAdminDepartments(parseInt(adminFormData.collegeId));
    } else {
      setAdminDepartments([]);
    }
  }, [adminFormData.collegeId, showAdminPanel]);

  const loadAdminColleges = async () => {
    try {
      const colleges = await getColleges();
      setAdminColleges(colleges.data || []);
    } catch (error) {
      console.error('Error loading colleges:', error);
      setAdminColleges([]);
    }
  };

  const loadAdminDepartments = async (collegeId: number) => {
    try {
      const departments = await getDepartments(collegeId);
      setAdminDepartments(departments.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
      setAdminDepartments([]);
    }
  };

  const loadContentData = async () => {
    if (!selectedSubtopic) return;

    setIsLoadingContent(true);
    setLoadedSections(new Set()); // Reset loaded sections

    const subtopicId = selectedSubtopic.id.toString();

    // Bypass cache for admin users to ensure instant updates
    if (!isAdmin) {
      // Check sessionStorage cache first (only for non-admin users)
      const cachedContent = getContentFromCache(subtopicId);
      if (cachedContent) {
        setContentData(cachedContent);
        setIsLoadingContent(false);
        // Mark all sections as loaded
        setLoadedSections(new Set(["featuredVideo", "videos", "driveResources", "notes", "questions"]));
        return;
      }
    } else {
      // Clear cache for admin users
      try {
        const cacheKey = `content_cache_${subtopicId}`;
        sessionStorage.removeItem(cacheKey);
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    }

    // Fetch from API
    try {
      const content = await loadContent(subtopicId);
      if (content && Array.isArray(content) && content.length > 0) {
        // Transform the backend content format to frontend format
        const transformedContent = transformContentData(content);
        // Store in sessionStorage cache only for non-admin users
        if (!isAdmin) {
          setContentInCache(subtopicId, transformedContent);
        }
        setContentData(transformedContent);
      } else {
        // No fallback content - sections will render empty
        const emptyContent = {
          title: "",
          videos: [],
          driveResources: [],
          notes: "",
          questions: []
        };
        setContentData(emptyContent);
      }

      // Simulate progressive loading for demo
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "featuredVideo"])), 300);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "videos"])), 450);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "driveResources"])), 600);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "notes"])), 900);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "questions"])), 1200);

    } catch (error) {
      // On error, use empty content
      const emptyContent = {
        title: "",
        videos: [],
        driveResources: [],
        notes: "",
        questions: []
      };
      setContentData(emptyContent);

      // Still simulate progressive loading
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "featuredVideo"])), 300);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "videos"])), 450);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "driveResources"])), 600);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "notes"])), 900);
      setTimeout(() => setLoadedSections(prev => new Set([...prev, "questions"])), 1200);
    }

    setIsLoadingContent(false);
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
              id: item.id, // Store backend ID for deletion
              title: item.title || 'Video Content',
              youtubeUrl: item.content
            });
          }
          break;
        case 'drive':
          contentMap.driveResources.push({
            id: item.id, // Store backend ID for deletion
            title: item.title || 'Drive Resource',
            url: item.content
          });
          break;
        case 'notes':
          if (item.content) {
            contentMap.notes.push({
              id: item.id, // Store backend ID for deletion
              content: item.content
            });
          }
          break;
        case 'question':
          contentMap.questions.push({
            id: item.id, // Store backend ID for deletion
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
      notes: contentMap.notes.map((n: any) => n.content).join('\n\n'),
      notesItems: contentMap.notes, // Store notes with IDs
      questions: contentMap.questions
    };
  };


  const handleMenuToggle = () => setSidebarCollapsed(!sidebarCollapsed);

  // Add keyboard shortcuts for sidebar toggle (Ctrl+Z) and highlight undo (Ctrl+Z when toolbar is visible)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'z') {
        event.preventDefault();

        // If highlight toolbar is visible, undo the last highlight instead of toggling sidebar
        if (showToolbar) {
          undoLastHighlight();
        } else {
          setSidebarCollapsed(!sidebarCollapsed);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, showToolbar]);

  // Undo last highlight functionality
  const undoLastHighlight = () => {
    const highlights = document.querySelectorAll('.user-highlight');
    if (highlights.length > 0) {
      const lastHighlight = highlights[highlights.length - 1] as HTMLElement;
      const parent = lastHighlight.parentNode!;
      while (lastHighlight.firstChild) {
        parent.insertBefore(lastHighlight.firstChild, lastHighlight);
      }
      parent.removeChild(lastHighlight);
      setShowToolbar(false);
    }
  };

  const handleNavigate = (path: string) => {
    if (path === "/login") onNavigateToLogin();
    if (path === "/heirarchy") onNavigateToHeirarchy();
  };

  const handleCourseClick = async (course: any) => {
    console.log('Course clicked:', course);
    setSelectedCourse(course);
    setIsLoadingTopics(true);
    try {
      console.log('Loading topics for course:', course.id);
      await loadTopics(course.id);
      console.log('Topics loaded, current topics state:', topics);
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
    // Don't clear selectedSubtopic and contentData to maintain focus
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
    // Don't clear selectedSubtopic and contentData to maintain focus
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
    // Conditional sections based on mode
    const allSections = ["featuredVideo", "videos", "driveResources", "notes", "questions"];

    return allSections.filter(section => {
      switch (mode) {
        case "deep":
          return true; // Show all sections
        case "normal":
          return section !== "notes"; // Hide notes section
        case "rush":
          return section !== "featuredVideo" && section !== "notes"; // Hide videos and notes
        default:
          return true;
      }
    });
  };

  const renderSection = (section: string) => {
    // Show loading animation if content is still loading and section hasn't loaded yet
    if (isLoadingContent && !loadedSections.has(section)) {
      return (
        <section className="section" key={`${section}-loading`}>
          <h2 className="section-title">
            {section === "featuredVideo" && "Video Content"}
            {section === "driveResources" && "Presentation & Resources"}
            {section === "notes" && "Understanding the Concept"}
            {section === "questions" && "Practice Questions"}
          </h2>
          <div className="section-loading">
            <div className="section-loading-spinner"></div>
            <span className="section-loading-text">Loading...</span>
          </div>
        </section>
      );
    }

    switch (section) {
      case "featuredVideo":
        if (!contentData.featuredVideo) return null;
        return (
          <section className="section" key="featuredVideo">
            <h2 className="section-title">Video Content</h2>
            <div className="video-card compact centered-content">
              <div className="video-wrapper small">
                {playingVideos["featured"] ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(contentData.featuredVideo.youtubeUrl)}?autoplay=1&rel=0&modestbranding=1&showinfo=0`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="video-placeholder"
                    onClick={() => handlePlayVideo("featured")}
                    style={{
                      backgroundImage: `url(https://img.youtube.com/vi/${getYoutubeId(contentData.featuredVideo.youtubeUrl)}/maxresdefault.jpg)`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="play-icon">▶</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      case "videos":
        const hasVideos = contentData.videos && contentData.videos.length > 0;
        return (
          <section className="section" key="videos">
            <div className="section-header">
              <h2 className="section-title">Videos</h2>
              {isAdmin && hasVideos && (
                <button
                  className="section-delete-btn"
                  onClick={async () => {
                    try {
                      // Delete all videos for this subtopic
                      if (!selectedSubtopic) return;
                      const contentItems = await getSubtopicContent(parseInt(selectedSubtopic.id));
                      const videoItems = contentItems.data.filter((item: any) => item.contentType === 'video');
                      for (const item of videoItems) {
                        await deleteSubtopicContent(item.id);
                      }
                      loadContentData();
                    } catch (error) {
                      console.error('Error deleting videos:', error);
                    }
                  }}
                  title="Delete all videos"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="video-list">
              {contentData.videos && contentData.videos.length > 0 && contentData.videos.map((video: any, index: number) => {
                const id = `video-${index}`;
                return (
                  <div className="video-card compact" key={index}>
                    <div className="video-card-header">
                      <p className="video-title">{video.title}</p>
                      {isAdmin && (
                        <button
                          className="video-delete-btn"
                          onClick={async () => {
                            try {
                              await deleteSubtopicContent(video.id);
                              loadContentData();
                            } catch (error) {
                              console.error('Error deleting video:', error);
                            }
                          }}
                          title="Delete video"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="video-wrapper small ">
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

              {/* Add Video Button for Admin - always show for admins */}
              {isAdmin && (
                <div className="content-add-section">
                  {!showContentAddForm.visible || showContentAddForm.section !== 'videos' ? (
                    <button
                      className="content-add-btn"
                      onClick={() => {
                        setShowContentAddForm({ section: 'videos', visible: true });
                        setContentAddFormData({ contentType: 'video', title: '', content: '' });
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                      </svg>
                      Add Video
                    </button>
                  ) : (
                    <div className="content-add-form">
                      <div className="add-form-row">
                        <input
                          type="text"
                          placeholder="Video Title"
                          value={contentAddFormData.title}
                          onChange={(e) => setContentAddFormData({...contentAddFormData, title: e.target.value})}
                          className="content-form-input"
                        />
                        <input
                          type="url"
                          placeholder="YouTube URL"
                          value={contentAddFormData.content}
                          onChange={(e) => setContentAddFormData({...contentAddFormData, content: e.target.value})}
                          className="content-form-input"
                        />
                      </div>
                      <div className="add-form-buttons">
                        <button
                          className="add-form-submit"
                          onClick={async () => {
                            if (selectedSubtopic) {
                              try {
                                await createSubtopicContent(parseInt(selectedSubtopic.id), {
                                  contentType: 'video', // Backend expects 'video' not 'videos'
                                  contentOrder: 1,
                                  title: contentAddFormData.title,
                                  content: contentAddFormData.content
                                });
                                // Refresh content
                                loadContentData();
                                setShowContentAddForm({ section: '', visible: false });
                              } catch (error) {
                                console.error('Error adding content:', error);
                              }
                            }
                          }}
                          disabled={!contentAddFormData.title.trim() || !contentAddFormData.content.trim()}
                        >
                          Add
                        </button>
                        <button
                          className="add-form-cancel"
                          onClick={() => setShowContentAddForm({ section: '', visible: false })}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      case "driveResources":
        const hasDriveResources = contentData.driveResources && contentData.driveResources.length > 0;
        return (
          <section className="section" key="driveResources">
            <div className="section-header">
              <h2 className="section-title">Presentation & Resources</h2>
              {isAdmin && hasDriveResources && (
                <button
                  className="section-delete-btn"
                  onClick={async () => {
                    try {
                      // Delete all drive resources for this subtopic
                      if (!selectedSubtopic) return;
                      const contentItems = await getSubtopicContent(parseInt(selectedSubtopic.id));
                      const driveItems = contentItems.data.filter((item: any) => item.contentType === 'drive');
                      for (const item of driveItems) {
                        await deleteSubtopicContent(item.id);
                      }
                      loadContentData();
                    } catch (error) {
                      console.error('Error deleting drive resources:', error);
                    }
                  }}
                  title="Delete all resources"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="drive-resources-container centered-content">
              {contentData.driveResources.map((res: any, index: number) => (
                <div className="resource-item centered-content" key={index}>
                  <div className="resource-item-header">
                    {res.title && <h3 className="resource-title">{res.title}</h3>}
                    {isAdmin && (
                      <button
                        className="resource-delete-btn"
                        onClick={async () => {
                          try {
                            await deleteSubtopicContent(res.id);
                            loadContentData();
                          } catch (error) {
                            console.error('Error deleting resource:', error);
                          }
                        }}
                        title="Delete resource"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="resource-frame-wrapper">
                    <iframe
                      className="resource-frame"
                      src={res.url}
                      allow="autoplay"
                      title={res.title}
                    />
                  </div>
                </div>
              ))}

              {/* Add Content Button for Admin - always show for admins */}
              {isAdmin && (
                <div className="content-add-section">
                  {!showContentAddForm.visible || showContentAddForm.section !== 'driveResources' ? (
                    <button
                      className="content-add-btn"
                      onClick={() => {
                        setShowContentAddForm({ section: 'driveResources', visible: true });
                        setContentAddFormData({ contentType: 'drive', title: '', content: '' });
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Add Resource
                    </button>
                  ) : (
                    <div className="content-add-form">
                      <div className="add-form-row">
                        <input
                          type="text"
                          placeholder="Resource Title"
                          value={contentAddFormData.title}
                          onChange={(e) => setContentAddFormData({...contentAddFormData, title: e.target.value})}
                          className="content-form-input"
                        />
                        <input
                          type="url"
                          placeholder="Resource URL"
                          value={contentAddFormData.content}
                          onChange={(e) => setContentAddFormData({...contentAddFormData, content: e.target.value})}
                          className="content-form-input"
                        />
                      </div>
                      <div className="add-form-buttons">
                        <button
                          className="add-form-submit"
                          onClick={async () => {
                            if (selectedSubtopic) {
                              try {
                                await createSubtopicContent(parseInt(selectedSubtopic.id), {
                                  contentType: 'drive',
                                  contentOrder: 1,
                                  title: contentAddFormData.title,
                                  content: contentAddFormData.content
                                });
                                // Refresh content
                                loadContentData();
                                setShowContentAddForm({ section: '', visible: false });
                              } catch (error) {
                                console.error('Error adding content:', error);
                              }
                            }
                          }}
                          disabled={!contentAddFormData.title.trim() || !contentAddFormData.content.trim()}
                        >
                          Add
                        </button>
                        <button
                          className="add-form-cancel"
                          onClick={() => setShowContentAddForm({ section: '', visible: false })}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      case "notes":
        const hasNotes = contentData.notes && contentData.notes.trim() !== "";
        return (
          <section className="section notes" key="notes">
            <div className="section-header">
              <h2 className="section-title">Understanding the Concept</h2>
              {isAdmin && hasNotes && (
                <button
                  className="section-delete-btn"
                  onClick={async () => {
                    try {
                      // Delete all notes for this subtopic
                      if (!selectedSubtopic) return;
                      const contentItems = await getSubtopicContent(parseInt(selectedSubtopic.id));
                      const notesItems = contentItems.data.filter((item: any) => item.contentType === 'notes');
                      for (const item of notesItems) {
                        await deleteSubtopicContent(item.id);
                      }
                      loadContentData();
                    } catch (error) {
                      console.error('Error deleting notes:', error);
                    }
                  }}
                  title="Delete all notes"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="notes-container centered-content" ref={notesRef} onMouseUp={handleSelection} onClick={removeHighlight}>
              {contentData.notesItems && contentData.notesItems.length > 0 ? (
                contentData.notesItems.map((noteItem: any) => (
                  <div key={noteItem.id} className="note-item-wrapper">
                    {isAdmin && (
                      <button
                        className="note-delete-btn"
                        onClick={async () => {
                          try {
                            await deleteSubtopicContent(noteItem.id);
                            loadContentData();
                          } catch (error) {
                            console.error('Error deleting note:', error);
                          }
                        }}
                        title="Delete note"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                    <div className="note-content">{renderMarkdown(noteItem.content)}</div>
                  </div>
                ))
              ) : (
                renderMarkdown(contentData.notes || '')
              )}
            </div>
            {showToolbar && <div className="highlight-toolbar" style={{ left: toolbarPos.x, top: toolbarPos.y }}><button onClick={applyHighlight}>Highlight</button></div>}

            {/* Add Content Button for Admin - always show for admins */}
            {isAdmin && (
              <div className="content-add-section">
                {!showContentAddForm.visible || showContentAddForm.section !== 'notes' ? (
                  <button
                    className="content-add-btn"
                    onClick={() => {
                      setShowContentAddForm({ section: 'notes', visible: true });
                      setContentAddFormData({ contentType: 'notes', title: '', content: '' });
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Add Notes
                  </button>
                ) : (
                  <div className="content-add-form">
                    <div className="add-form-row">
                      <input
                        type="text"
                        placeholder="Notes Title"
                        value={contentAddFormData.title}
                        onChange={(e) => setContentAddFormData({...contentAddFormData, title: e.target.value})}
                        className="content-form-input"
                      />
                      <textarea
                        placeholder="Notes Content"
                        value={contentAddFormData.content}
                        onChange={(e) => setContentAddFormData({...contentAddFormData, content: e.target.value})}
                        className="content-form-textarea"
                        rows={4}
                      />
                    </div>
                    <div className="add-form-buttons">
                      <button
                        className="add-form-submit"
                        onClick={async () => {
                          if (selectedSubtopic) {
                            try {
                              await createSubtopicContent(parseInt(selectedSubtopic.id), {
                                contentType: 'notes',
                                contentOrder: 1,
                                title: contentAddFormData.title,
                                content: contentAddFormData.content
                              });
                              // Refresh content
                              loadContentData();
                              setShowContentAddForm({ section: '', visible: false });
                            } catch (error) {
                              console.error('Error adding content:', error);
                            }
                          }
                        }}
                        disabled={!contentAddFormData.title.trim() || !contentAddFormData.content.trim()}
                      >
                        Add
                      </button>
                      <button
                        className="add-form-cancel"
                        onClick={() => setShowContentAddForm({ section: '', visible: false })}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        );
      case "questions":
        const hasQuestions = contentData.questions && contentData.questions.length > 0;
        return (
          <section className="section" key="questions">
            <div className="section-header">
              <h2 className="section-title">Practice Questions</h2>
              {isAdmin && hasQuestions && (
                <button
                  className="section-delete-btn"
                  onClick={async () => {
                    try {
                      // Delete all questions for this subtopic
                      if (!selectedSubtopic) return;
                      const contentItems = await getSubtopicContent(parseInt(selectedSubtopic.id));
                      const questionItems = contentItems.data.filter((item: any) => item.contentType === 'question');
                      for (const item of questionItems) {
                        await deleteSubtopicContent(item.id);
                      }
                      loadContentData();
                    } catch (error) {
                      console.error('Error deleting questions:', error);
                    }
                  }}
                  title="Delete all questions"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              )}
            </div>
            <div className="questions-widget">
              <div className="qa-widget-list">
                {contentData.questions.map((q: any, index: number) => (
                  <div className="qa-widget-item" key={index}>
                    {isAdmin && (
                      <button
                        className="qa-delete-btn"
                        onClick={async () => {
                          try {
                            await deleteSubtopicContent(q.id);
                            loadContentData();
                          } catch (error) {
                            console.error('Error deleting question:', error);
                          }
                        }}
                        title="Delete question"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                    <details className="qa-widget-details">
                      <summary className="qa-widget-question">
                        <div className="question-content">
                          <span className="question-number">{index + 1}.</span>
                          <span className="question-text">{q.question}</span>
                        </div>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="dropdown-arrow"
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </summary>
                      <div className="qa-widget-answer">
                        <div className="answer-content">{q.answer}</div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>

              {/* Add Q&A Button for Admin - always show for admins */}
              {isAdmin && (
                <div className="content-add-section">
                  {!showContentAddForm.visible || showContentAddForm.section !== 'questions' ? (
                    <button
                      className="content-add-btn"
                      onClick={() => {
                        setShowContentAddForm({ section: 'questions', visible: true });
                        setContentAddFormData({ contentType: 'question', title: '', content: '' });
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                      Add Q&A
                    </button>
                  ) : (
                    <div className="content-add-form">
                      <div className="add-form-row">
                        <input
                          type="text"
                          placeholder="Question"
                          value={contentAddFormData.title}
                          onChange={(e) => setContentAddFormData({...contentAddFormData, title: e.target.value})}
                          className="content-form-input"
                        />
                        <textarea
                          placeholder="Answer"
                          value={contentAddFormData.content}
                          onChange={(e) => setContentAddFormData({...contentAddFormData, content: e.target.value})}
                          className="content-form-textarea"
                          rows={4}
                        />
                      </div>
                      <div className="add-form-buttons">
                        <button
                          className="add-form-submit"
                          onClick={async () => {
                            if (selectedSubtopic) {
                              try {
                                await createSubtopicContent(parseInt(selectedSubtopic.id), {
                                  contentType: 'question', // Backend expects 'question' not 'questions'
                                  contentOrder: 1,
                                  title: contentAddFormData.title, // Question goes in title
                                  content: '', // Empty content
                                  metadata: { answer: contentAddFormData.content } // Answer goes in metadata
                                });
                                // Refresh content
                                loadContentData();
                                setShowContentAddForm({ section: '', visible: false });
                              } catch (error) {
                                console.error('Error adding content:', error);
                              }
                            }
                          }}
                          disabled={!contentAddFormData.title.trim() || !contentAddFormData.content.trim()}
                        >
                          Add
                        </button>
                        <button
                          className="add-form-cancel"
                          onClick={() => setShowContentAddForm({ section: '', visible: false })}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      default: return null;
    }
  };

  return (
    <div className="content-view login-style">
      <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} onModeChange={setMode} onAdminToggle={() => setShowAdminPanel(!showAdminPanel)} />
      {(() => {
        console.log('Calculating sidebar - selectedCourse:', selectedCourse, 'topics:', topics, 'courses:', courses);
        const sidebarMode = selectedTopic ? "subtopics" : selectedCourse ? "topics" : "courses";
        const sidebarItems = selectedTopic ? subtopics : selectedCourse ? topics : courses;
        console.log('Sidebar mode:', sidebarMode, 'Items count:', sidebarItems?.length || 0, 'Items:', sidebarItems);

        return (
          <Sidebar
            key={`${sidebarMode}-${sidebarItems?.length || 0}`}
            isCollapsed={sidebarCollapsed}
            mode={sidebarMode}
            items={sidebarItems}
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
        onDeleteItem={isAdmin ? handleDeleteItem : undefined}
        onAddItem={isAdmin ? handleAddItem : undefined}
        showAddForm={showAddForm}
        addFormData={addFormData}
        onAddFormChange={setAddFormData}
        onAddSubmit={handleAddSubmit}
        onCancelAdd={() => setShowAddForm({ mode: '', visible: false })}
          />
        );
      })()}


      <div className={`content-main ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${selectedSubtopic ? "scroll-enabled" : "scroll-disabled"}`}>
        {selectedSubtopic && (
          <div className="content-header">
            <h1 className="fade-in">{selectedSubtopic.name}</h1>
          </div>
        )}
        {!contentData && selectedSubtopic && (
          <div className="content-loading section-loading">
            <div className="section-loading-spinner"></div>
            <span className="section-loading-text">Loading content...</span>
          </div>
        )}
        {!selectedSubtopic && (
          <div className="content-placeholder">
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

        {/* Admin Panel - Only show for admin users */}
        {isAdmin && showAdminPanel && (
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h3>Admin Panel</h3>
              <button
                className="admin-close-btn"
                onClick={() => setShowAdminPanel(false)}
              >
                ✕
              </button>
            </div>

            <div className="admin-tabs">
              {['colleges', 'departments', 'semesters'].map((tab) => (
                <button
                  key={tab}
                  className={`admin-tab ${adminMode === tab ? 'active' : ''}`}
                  onClick={() => setAdminMode(tab as any)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="admin-content">
              {adminMode === 'colleges' && (
                <div className="admin-form">
                  <h4>Add College</h4>
                  <input
                    type="text"
                    placeholder="College Name"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                  />
                  <button className="admin-submit-btn" onClick={handleAdminSubmit}>Add College</button>
                </div>
              )}

              {adminMode === 'departments' && (
                <div className="admin-form">
                  <h4>Add Department</h4>
                  <select
                    value={adminFormData.collegeId}
                    onChange={(e) => setAdminFormData({...adminFormData, collegeId: e.target.value})}
                  >
                    <option value="">Select College</option>
                    {adminColleges.map((college: any) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Department Name"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                  />
                  <button className="admin-submit-btn" onClick={handleAdminSubmit}>Add Department</button>
                </div>
              )}

              {adminMode === 'semesters' && (
                <div className="admin-form">
                  <h4>Add Semester</h4>
                  <select
                    value={adminFormData.collegeId}
                    onChange={(e) => setAdminFormData({...adminFormData, collegeId: e.target.value, departmentId: ''})}
                  >
                    <option value="">Select College First</option>
                    {adminColleges.map((college: any) => (
                      <option key={college.id} value={college.id}>
                        {college.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={adminFormData.departmentId}
                    onChange={(e) => setAdminFormData({...adminFormData, departmentId: e.target.value})}
                    disabled={!adminFormData.collegeId}
                  >
                    <option value="">
                      {adminFormData.collegeId ? 'Select Department' : 'Select College First'}
                    </option>
                    {adminDepartments.map((department: any) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Semester Name (e.g., I, II, III)"
                    value={adminFormData.name}
                    onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                  />
                  <button className="admin-submit-btn" onClick={handleAdminSubmit}>Add Semester</button>
                </div>
              )}


            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ContentView;