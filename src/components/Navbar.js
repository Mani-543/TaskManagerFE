import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-500 text-white px-4 md:px-7 py-4 shadow-md">

      {/* TOP BAR */}
      <div className="flex justify-between items-center">

        {/* Logo */}
        <div className="text-xl md:text-3xl font-bold">
          📝 Task Manager
        </div>

        {/* HAMBURGER (Mobile only) */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6">
          {token ? (
            <>
              <Link to="/dashboard" className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition">
                Dashboard
              </Link>

              <Link to="/profile" className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded transition">
                👤 Profile
              </Link>

              <button
                onClick={() => navigate("/progress")}
                className="bg-purple-500 hover:bg-purple-600 px-3 py-1 rounded transition"
              >
                📊 Progress
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="flex flex-col mt-4 gap-3 md:hidden">
          {token ? (
            <>
              <Link
                to="/dashboard"
                className="bg-blue-500 hover:bg-blue-600 px-3 py-2 rounded transition"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                to="/profile"
                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-2 rounded transition"
                onClick={() => setMenuOpen(false)}
              >
                👤 Profile
              </Link>

              <button
                onClick={() => {
                  navigate("/progress");
                  setMenuOpen(false);
                }}
                className="bg-purple-500 hover:bg-purple-600 px-3 py-2 rounded text-left transition"
              >
                📊 Progress
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500 px-3 py-2 rounded text-left hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                Login
              </Link>

              <Link to="/register" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;