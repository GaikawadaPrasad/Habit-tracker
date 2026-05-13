import {  Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import { useAuth } from "../Context/AurhContext";
import LoadingPage from "./Components/LoadingPage";

function App() {
  const { currentUser, loading } = useAuth();
  if (loading) return(
    <>
      <LoadingPage />
    </>
  );

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={currentUser ? <Home /> : <Login />}
        />

        <Route
          path="/home"
          element={currentUser ? <Home /> : <Login />}
        />

        <Route
          path="/login"
          element={currentUser ? <Home /> : <Login />}
        />

        <Route
          path="/signin"
          element={currentUser ? <Home /> : <Signin />}
        />

        {/* Catch-all: redirect unknown routes to dashboard */}
        <Route
          path="*"
          element={currentUser ? <Home /> : <Login />}
        />
      </Routes>
    </>
  );
}

export default App;
