import { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "register">("login");

  const navigateToRegister = () => setCurrentPage("register");
  const navigateToLogin = () => setCurrentPage("login");

  return currentPage === "login" ? (
    <Login onNavigateToRegister={navigateToRegister} />
  ) : (
    <Register onNavigateToLogin={navigateToLogin} />
  );
}

export default App;
