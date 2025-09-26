import { LogOut } from "lucide-react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login"); // redirect after logout
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
      title="Logout"
    >
      <LogOut className="w-6 h-6 text-white" />
    </button>
  );
}
