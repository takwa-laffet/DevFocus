import { useEffect, useState } from "react";
import Background from "./components/Background";
import GlassBoard from "./components/GlassBoard";
import { Floating } from "./components/floating";
import TodoList from "./components/Tdo";
import GlassNotesBoard from "./components/GlassNotesBoard";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import LogoutButton from "./components/LogoutButton";
import { supabase } from "./components/supabaseClient";

function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // get current session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // listen to login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          backgroundColor: "black",
        }}
      >
        <Background />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {/* 🔹 Routes */}
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/notes" element={<GlassNotesBoard />} />
            <Route path="/todo" element={<TodoList />} />
            <Route path="/scrum" element={<GlassBoard />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>

          {/* 🔹 Show Floating only if logged in */}
          {session && (
            <div className="fixed bottom-0 left-0 z-50 w-full">
              <Floating />
            </div>
          )}

          {/* 🔹 Global Logout Icon */}
          {session && <LogoutButton />}
        </div>
      </div>
    </Router>
  );
}

export default App;
