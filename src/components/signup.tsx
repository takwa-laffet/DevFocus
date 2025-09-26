import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./supabaseClient";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password strength rules
  const validatePassword = (pwd: string) => {
    const rules = [
      { regex: /.{8,}/, message: "At least 8 characters" },
      { regex: /[A-Z]/, message: "At least one uppercase letter" },
      { regex: /[a-z]/, message: "At least one lowercase letter" },
      { regex: /[0-9]/, message: "At least one number" },
      { regex: /[^A-Za-z0-9]/, message: "At least one special character" },
    ];
    return rules.filter((rule) => !rule.regex.test(pwd)).map((r) => r.message);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Confirm password check
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Password validation
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError("Password not strong enough: " + passwordErrors.join(", "));
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name, // save name in user_metadata
          },
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Check your email to confirm your account!");
        console.log("User created:", data);
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen from-gray-900 via-gray-800 to-black">
      <div className="glass p-8 rounded-2xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center text-white mb-6">
          Sign Up
        </h1>
        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="glass-card px-4 py-2 rounded-lg focus:outline-none text-white placeholder-gray-300"
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="glass-card px-4 py-2 rounded-lg focus:outline-none text-white placeholder-gray-300"
            required
          />
          <button
            type="submit"
            className="glass-card py-2 rounded-lg font-semibold text-white hover:bg-white/20 transition"
          >
            Sign Up
          </button>
        </form>

        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}

        <p className="text-center text-sm text-gray-300 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
