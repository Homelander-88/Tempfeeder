import { useState } from "react";
import Auth from "./pages/Auth/Auth";
import ContentView from "./pages/ContentView/ContentView";
import Heirarchy from "./pages/Heirarchy/Heirarchy";
import CollegeDepartment from "./pages/CollegeDepartment/collegeDepartment";

function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "register" | "content" | "heirarchy" | "collegeDepartment">("login");

  const navigateToAuth = () => setCurrentPage("auth");
  const navigateToContent = () => setCurrentPage("content");
  const navigateToHeirarchy = () => setCurrentPage("heirarchy");
  const navigateToCollegeDepartment = () => setCurrentPage("collegeDepartment");

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onNavigateToRegister={navigateToRegister} onNavigateToContent={navigateToContent} />;
      case "register":
        return <Register onNavigateToLogin={navigateToLogin} onNavigateToCollegeDepartment={navigateToCollegeDepartment} />;
      case "collegeDepartment":
        return <CollegeDepartment onNavigateToContent={navigateToContent} onNavigateToLogin={navigateToLogin} />;
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
