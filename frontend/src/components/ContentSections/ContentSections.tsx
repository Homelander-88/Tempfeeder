import React from 'react';
import { VideosSection } from './VideosSection';
import { NotesSection } from './NotesSection';
import { ResourcesSection } from './ResourcesSection';
import { QASection } from './QASection';

interface Video {
  id: number;
  title?: string;
  youtubeUrl: string;
}

interface Resource {
  id: number;
  title?: string;
  url: string;
  metadata?: { resourceType?: string };
}

interface QAItem {
  id: number;
  question: string;
  answer: string;
}

interface ContentSectionsProps {
  videos: Video[];
  notes: string;
  resources: Resource[];
  questions: QAItem[];
  isAdmin: boolean;
  // Video handlers
  onDeleteVideo?: (videoId: number) => void;
  onAddVideo?: () => void;
  // Notes handlers
  onEditNotes?: () => void;
  // Resources handlers
  onDeleteResource?: (resourceId: number) => void;
  onAddResource?: () => void;
  onOpenResource?: (resourceId: number) => void;
  onFullscreenResource?: (resourceId: number) => void;
  // QA handlers
  onDeleteQuestion?: (questionId: number) => void;
  onAddQuestion?: () => void;
  onEditQuestion?: (questionId: number) => void;
}

export const ContentSections: React.FC<ContentSectionsProps> = ({
  videos,
  notes,
  resources,
  questions,
  isAdmin,
  onDeleteVideo,
  onAddVideo,
  onEditNotes,
  onDeleteResource,
  onAddResource,
  onOpenResource,
  onFullscreenResource,
  onDeleteQuestion,
  onAddQuestion,
  onEditQuestion
}) => {
  return (
    <>
      <VideosSection
        videos={videos}
        isAdmin={isAdmin}
        onDeleteVideo={onDeleteVideo}
        onAddVideo={onAddVideo}
      />

      <NotesSection
        notes={notes}
        isAdmin={isAdmin}
        onEditNotes={onEditNotes}
      />

      <ResourcesSection
        resources={resources}
        isAdmin={isAdmin}
        onDeleteResource={onDeleteResource}
        onAddResource={onAddResource}
        onOpenResource={onOpenResource}
        onFullscreenResource={onFullscreenResource}
      />

      <QASection
        questions={questions}
        isAdmin={isAdmin}
        onDeleteQuestion={onDeleteQuestion}
        onAddQuestion={onAddQuestion}
        onEditQuestion={onEditQuestion}
      />
    </>
  );
};
