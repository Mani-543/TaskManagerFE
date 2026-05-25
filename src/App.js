import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Profile from "./pages/Profile";
import ProgressPage from "./pages/ProgressPage";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TaskPage from "./pages/TaskPage";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Task Manager */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/create" element={<TaskForm />} />
        <Route path="/task/:id" element={<TaskPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;