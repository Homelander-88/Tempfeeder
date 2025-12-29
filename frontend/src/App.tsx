import { useState, useEffect } from "react";
import Login from "./pages/Auth/auth";
import ContentView from "./pages/ContentView/ContentView";
import CollegeDepartment from "./pages/CollegeDepartment/collegeDepartment";
import { HierarchyProvider } from "./context/HeirarchyContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<"login" | "register" | "content" | "heirarchy" | "collegeDepartment">("login");

  // Check if user has completed hierarchy setup
  const hasHierarchy = localStorage.getItem('hierarchy') !== null;

  const navigateToLogin = () => setCurrentPage("login");
  const navigateToRegister = () => setCurrentPage("register");
  const navigateToContent = () => setCurrentPage("content");
  const navigateToHeirarchy = () => setCurrentPage("heirarchy");
  const navigateToCollegeDepartment = () => setCurrentPage("collegeDepartment");

  // Determine initial page based on authentication and hierarchy status
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // User is authenticated
        if (hasHierarchy) {
          // User has completed hierarchy setup, go to content
          setCurrentPage("content");
        } else {
          // User hasn't completed hierarchy setup, go to college department selection
          setCurrentPage("collegeDepartment");
        }
      } else {
        // User is not authenticated, show login
        setCurrentPage("login");
      }
    }
  }, [isAuthenticated, isLoading, hasHierarchy]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0E0E10',
        color: '#c4c7cc'
      }}>
        Loading...
      </div>
    );
  }

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
        // Heirarchy component is no longer used - users go directly to ContentView
        return <ContentView onNavigateToLogin={navigateToLogin} onNavigateToHeirarchy={navigateToHeirarchy} />;
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

