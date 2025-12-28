import React, { useState, useRef } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./ContentView.css";

type Video = { title: string; youtubeUrl: string };
type Question = { question: string; answer: string };
type DriveResource = { title?: string; url: string };

type ContentData = {
  title: string;
  featuredVideo?: Video;
  videos: Video[];
  driveResources: DriveResource[];
  notes: string;
  questions: Question[];
};

interface ContentViewProps {
  onNavigateToLogin: () => void;
  onNavigateToHeirarchy: () => void;
}

const contentData: ContentData = {
  title: "Operating Systems – Process Scheduling",
  featuredVideo: {
    title: "🔥 Featured: CPU Scheduling Explained",
    youtubeUrl: "https://youtu.be/KgpnfT5bgLY?si=xDnFCZTt1-pb2VEt",
  },
  videos: [
    { title: "Introduction to Process Scheduling", youtubeUrl: "https://www.youtube.com/watch?v=9K3dRz3u4xY" },
  ],
  driveResources: [
    { url: "https://drive.google.com/embeddedfolderview?id=12L4bNKtXazVnham-fmZekCHLvYeYZtoB#grid" },
    { url: "https://drive.google.com/embeddedfolderview?id=ANOTHER_ID#grid" },
  ],
  notes: `Process scheduling is the activity of the process manager that decides which process gets CPU time.\n\nKey algorithms:\n• FCFS\n• SJF\n• Priority\n• Round Robin`,
  questions: [
    { question: "What is process scheduling?", answer: "It is the method by which the OS decides which process gets CPU time." },
  ],
};

const ContentView: React.FC<ContentViewProps> = ({ onNavigateToLogin, onNavigateToHeirarchy }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({});
  const [mode, setMode] = useState<"deep" | "normal" | "rush">("normal"); // initial mode

  const notesRef = useRef<HTMLDivElement>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });

  const handleMenuToggle = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleNavigate = (path: string) => {
    if (path === "/login") onNavigateToLogin();
    if (path === "/heirarchy") onNavigateToHeirarchy();
  };

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : "";
  };

  const handlePlayVideo = (id: string) => setPlayingVideos({ ...playingVideos, [id]: true });

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
    switch (mode) {
      case "deep": return ["featuredVideo","videos","driveResources","notes","questions"];
      case "normal": return ["featuredVideo","videos","driveResources","questions","notes"];
      case "rush": return ["driveResources","questions","notes","featuredVideo","videos"];
      default: return ["featuredVideo","videos","driveResources","notes","questions"];
    }
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
              {contentData.videos.map((video, index) => {
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
        return contentData.driveResources.map((res, index) => (
          <section className="section" key={`drive-${index}`}>
            <h2 className="section-title fade-in delay-4">Resources</h2>
            <div className="resource-frame-wrapper hover-zoom">
              <iframe className="resource-frame" src={res.url} allow="autoplay" />
            </div>
          </section>
        ));
      case "notes":
        return (
          <section className="section notes" key="notes">
            <h2 className="section-title fade-in delay-5">Notes</h2>
            <div className="notes-container" ref={notesRef} onMouseUp={handleSelection} onClick={removeHighlight}>
              {contentData.notes.split("\n").map((line, i) => <p key={i}>{line}</p>)}
            </div>
            {showToolbar && <div className="highlight-toolbar" style={{ left: toolbarPos.x, top: toolbarPos.y }}><button onClick={applyHighlight}>Highlight</button></div>}
          </section>
        );
      case "questions":
        if (!contentData.questions.length) return null;
        return (
          <section className="section" key="questions">
            <h2 className="section-title fade-in delay-6">Questions</h2>
            <div className="qa-list" style={{ maxWidth: "820px" }}>
              {contentData.questions.map((q,index) => (
                <div className="qa-item" key={index}>
                  <details>
                    <summary className="qa-question">{q.question} <span className="arrow">▼</span></summary>
                    <div className="qa-answer fade-slide">{q.answer}</div>
                  </details>
                </div>
              ))}
            </div>
          </section>
        );
      default: return null;
    }
  };

  return (
    <div className="content-view login-style">
      <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} onModeChange={setMode} />
      <Sidebar isCollapsed={sidebarCollapsed} />
      <div className={`content-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="content-header"><h1 className="fade-in">{contentData.title} <span style={{ fontSize: "0.8rem", color: "#888" }}>({mode.toUpperCase()} MODE)</span></h1></div>
        {sectionsOrder().map((section) => renderSection(section))}
      </div>
    </div>
  );
};

export default ContentView;
