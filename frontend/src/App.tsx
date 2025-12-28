import { useState } from "react";
import Auth from "./pages/Auth/Auth";
import ContentView from "./pages/ContentView/ContentView";
import Heirarchy from "./pages/Heirarchy/Heirarchy";

function App() {
  const [currentPage, setCurrentPage] = useState<"auth" | "content" | "heirarchy">("auth");

  const navigateToAuth = () => setCurrentPage("auth");
  const navigateToContent = () => setCurrentPage("content");
  const navigateToHeirarchy = () => setCurrentPage("heirarchy");

  const renderPage = () => {
    switch (currentPage) {
      case "auth":
        return <Auth onNavigateToContent={navigateToContent} />;
      case "content":
        return <ContentView onNavigateToLogin={navigateToAuth} onNavigateToHeirarchy={navigateToHeirarchy} />;
      case "heirarchy":
        return <Heirarchy onNavigateToLogin={navigateToAuth} onNavigateToContent={navigateToContent} />;
      default:
        return <Auth onNavigateToContent={navigateToContent} />;
    }
  };

  return renderPage();
}

export default App;
