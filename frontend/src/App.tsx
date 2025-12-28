import { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ContentView from "./pages/ContentView/ContentView";
import Heirarchy from "./pages/Heirarchy/Heirarchy";

function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "register" | "content" | "heirarchy">("login");

  const navigateToRegister = () => setCurrentPage("register");
  const navigateToLogin = () => setCurrentPage("login");
  const navigateToContent = () => setCurrentPage("content");
  const navigateToHeirarchy = () => setCurrentPage("heirarchy");

  const renderPage = () => {
    switch (currentPage) {
      case "login":
        return <Login onNavigateToRegister={navigateToRegister} onNavigateToContent={navigateToContent} />;
      case "register":
        return <Register onNavigateToLogin={navigateToLogin} />;
      case "content":
        return <ContentView onNavigateToLogin={navigateToLogin} onNavigateToHeirarchy={navigateToHeirarchy} />;
      case "heirarchy":
        return <Heirarchy onNavigateToLogin={navigateToLogin} onNavigateToContent={navigateToContent} />;
      default:
        return <Login onNavigateToRegister={navigateToRegister} onNavigateToContent={navigateToContent} />;
    }
  };

  return renderPage();
}

export default App;
