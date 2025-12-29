import { useState } from "react";
import Login from "./pages/Auth/auth";
import ContentView from "./pages/ContentView/ContentView";
import Heirarchy from "./pages/Heirarchy/Heirarchy";
import CollegeDepartment from "./pages/CollegeDepartment/collegeDepartment";
import { HierarchyProvider } from "./context/HeirarchyContext";

function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "register" | "content" | "heirarchy" | "collegeDepartment">("login");

  // No automatic navigation to hierarchy - users will go to content view first

  const navigateToLogin = () => setCurrentPage("login");
  const navigateToRegister = () => setCurrentPage("register");
  const navigateToContent = () => setCurrentPage("content");
  const navigateToHeirarchy = () => setCurrentPage("heirarchy");
  const navigateToCollegeDepartment = () => setCurrentPage("collegeDepartment");

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onNavigateToRegister={navigateToRegister} onNavigateToContent={navigateToContent} onNavigateToHeirarchy={navigateToHeirarchy} onNavigateToCollegeDepartment={navigateToCollegeDepartment} />;
      case "register":
        return <Login onNavigateToRegister={navigateToRegister} onNavigateToContent={navigateToContent} onNavigateToHeirarchy={navigateToHeirarchy} onNavigateToCollegeDepartment={navigateToCollegeDepartment} initialMode="register" />;
      case "collegeDepartment":
        return <CollegeDepartment onNavigateToContent={navigateToContent} />;
      case "content":
        return <ContentView onNavigateToLogin={navigateToLogin} onNavigateToHeirarchy={navigateToHeirarchy} />;
      case "heirarchy":
        return <Heirarchy onNavigateToLogin={navigateToLogin} onNavigateToContent={navigateToContent} />;
      default:
        return <Login onNavigateToRegister={navigateToRegister} onNavigateToContent={navigateToContent} onNavigateToHeirarchy={navigateToHeirarchy} onNavigateToCollegeDepartment={navigateToCollegeDepartment} />;
    }
  };

  return (
    <HierarchyProvider>
      {renderPage()}
    </HierarchyProvider>
  );
}

export default App;

