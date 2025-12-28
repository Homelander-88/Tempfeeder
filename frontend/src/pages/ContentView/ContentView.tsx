import React, { useState, useRef } from "react";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import "./ContentView.css";

type Video = { title: string; youtubeUrl: string };
type Question = { question: string; answer: string };
type Resource = { driveUrl: string };

type ContentData = {
  title: string;
  featuredVideo?: Video;
  videos: Video[];
  resources: Resource[]; // <-- now array of resources
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
    {
      title: "Introduction to Process Scheduling",
      youtubeUrl: "https://www.youtube.com/watch?v=9K3dRz3u4xY",
    },
  ],
  resources: [
    { driveUrl: "https://drive.google.com/embeddedfolderview?id=12L4bNKtXazVnham-fmZekCHLvYeYZtoB#grid" },
    { driveUrl: "https://drive.google.com/embeddedfolderview?id=1a2b3c4d5e6f7g8h9i0j#grid" }, // example second link
  ],
  notes: `Process scheduling is the activity of the process manager that decides
which process gets CPU time.

Key algorithms:
• FCFS
• SJF
• Priority
• Round Robin`,
  questions: [
    {
      question: "What is process scheduling?",
      answer:
        "It is the method by which the OS decides which process gets CPU time.",
    },
    {
      question: "What is Java?",
      answer:
        "Object Oriented Programming Language",
    }
  ],
};

const ContentView: React.FC<ContentViewProps> = ({
  onNavigateToLogin,
  onNavigateToHeirarchy,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({});

  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 });
  const notesRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = () => setSidebarCollapsed(!sidebarCollapsed);

  const handleNavigate = (path: string) => {
    if (path === "/login") onNavigateToLogin();
    if (path === "/heirarchy") onNavigateToHeirarchy();
  };

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : "";
  };

  const handlePlayVideo = (id: string) => {
    setPlayingVideos({ ...playingVideos, [id]: true });
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === "") {
      setShowToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);

    if (
      notesRef.current &&
      !notesRef.current.contains(range.commonAncestorContainer)
    ) {
      setShowToolbar(false);
      return;
    }

    const rect = range.getBoundingClientRect();

    setToolbarPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 40,
    });

    setShowToolbar(true);
  };

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);

    if (range.commonAncestorContainer.parentElement?.tagName === "MARK") {
      setShowToolbar(false);
      return;
    }

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
      while (target.firstChild) {
        parent.insertBefore(target.firstChild, target);
      }
      parent.removeChild(target);
    }
  };

  return (
    <div className="content-view">
      <Header onMenuToggle={handleMenuToggle} onNavigate={handleNavigate} onLogout={onNavigateToLogin} />
      <Sidebar isCollapsed={sidebarCollapsed} />

      <div className={`content-main ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <div className="content-header">
          <h1 className="fade-in">{contentData.title}</h1>
        </div>

        {/* Featured Video */}
        {contentData.featuredVideo && (
          <section className="section">
            <h2 className="section-title fade-in delay-2">Featured Video</h2>
            <div className="video-card compact">
              <p className="video-title">{contentData.featuredVideo.title}</p>
              <div className="video-wrapper small hover-zoom">
                {playingVideos["featured"] ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYoutubeId(
                      contentData.featuredVideo.youtubeUrl
                    )}?autoplay=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <div
                    className="video-placeholder"
                    onClick={() => handlePlayVideo("featured")}
                  >
                    <div className="play-icon">▶</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Videos */}
        {contentData.videos.length > 0 && (
          <section className="section">
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
                          src={`https://www.youtube.com/embed/${getYoutubeId(
                            video.youtubeUrl
                          )}?autoplay=1`}
                          allow="autoplay; encrypted-media"
                          allowFullScreen
                        />
                      ) : (
                        <div
                          className="video-placeholder"
                          onClick={() => handlePlayVideo(id)}
                        >
                          <div className="play-icon">▶</div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Resources */}
        {contentData.resources.length > 0 && (
          <section className="section">
            <h2 className="section-title fade-in delay-4">Resources</h2>
            {contentData.resources.map((res, idx) => (
              <div className="resource-frame-wrapper hover-zoom" key={idx}>
                <iframe
                  className="resource-frame"
                  src={res.driveUrl}
                  allow="autoplay"
                />
              </div>
            ))}
          </section>
        )}

        {/* Notes */}
        <section className="section notes">
          <h2 className="section-title fade-in delay-5">Notes</h2>
          <div
            className="notes-container"
            ref={notesRef}
            onMouseUp={handleSelection}
            onClick={removeHighlight}
          >
            {contentData.notes.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {showToolbar && (
            <div
              className="highlight-toolbar"
              style={{ left: toolbarPos.x, top: toolbarPos.y }}
            >
              <button onClick={applyHighlight}>Highlight</button>
            </div>
          )}
        </section>

        {/* Questions */}
        {contentData.questions.length > 0 && (
          <section className="section">
            <h2 className="section-title fade-in delay-6">Questions</h2>
            <div className="qa-list">
              {contentData.questions.map((q, index) => (
                <div className="qa-item" key={index}>
                  <details>
                    <summary className="qa-question">
                      {q.question} <span className="arrow">▼</span>
                    </summary>
                    <div className="qa-answer fade-slide">{q.answer}</div>
                  </details>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ContentView;
