import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
// If you use lucide-react (recommended):
import { LogOut } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Login successful!");
      console.log("Logged in user:", data.user);
      navigate("/notes");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen from-gray-900 via-gray-800 to-black relative">
      {/* Transparent white icon logout top-right */}
      {user && (
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition"
          title="Logout"
        >
          <LogOut className="w-6 h-6 text-white" />
        </button>
      )}

      <div className="glass p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Login
        </h1>
        {!user ? (
          <form onSubmit={handleLogin} className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass-card px-4 py-2 rounded-lg focus:outline-none text-white placeholder-gray-300"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-card px-4 py-2 rounded-lg focus:outline-none text-white placeholder-gray-300"
              required
            />
            <button
              type="submit"
              className="glass-card py-2 rounded-lg font-semibold text-white hover:bg-white/20 transition"
            >
              Login
            </button>
          </form>
        ) : (
          <p className="text-center text-green-400">
            You are already logged in!
          </p>
        )}
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
        {!user && (
          <p className="text-center text-sm text-gray-300 mt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
