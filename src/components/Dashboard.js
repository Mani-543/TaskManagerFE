import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Layout from "./Layout";
import TaskForm from "./TaskForm";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("my");

  const navigate = useNavigate();

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // ================= FETCH TASKS =================
  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTasks(res.data);
    } catch (err) {
      console.log(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const refreshTasks = () => {
    fetchTasks();
  };

  // ================= FILTER TASKS =================
  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "my") {
      return task.createdBy?._id === userId;
    }

    if (activeTab === "assigned") {
      return task.assignedTo?._id === userId;
    }

    if (activeTab === "shared") {
      return task.sharedWith?.some(
        (s) => s.user?._id === userId
      );
    }

    return true;
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto rounded-lg p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-r from-purple-300 via-pink-500 to-yellow-300 font-sans mt-3 md:mt-6">

        {/* TITLE */}
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
          📋 Task Dashboard
        </h1>

        {/* ADD TASK */}
        <TaskForm onTaskAdded={refreshTasks} />

        {/* TABS */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6 mb-4 border-b pb-2">

          <button
            onClick={() => setActiveTab("my")}
            className={`w-full sm:w-auto px-4 py-2 rounded text-sm sm:text-base ${
              activeTab === "my"
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            My Tasks
          </button>

          <button
            onClick={() => setActiveTab("assigned")}
            className={`w-full sm:w-auto px-4 py-2 rounded text-sm sm:text-base ${
              activeTab === "assigned"
                ? "bg-green-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Assigned To Me
          </button>

          <button
            onClick={() => setActiveTab("shared")}
            className={`w-full sm:w-auto px-4 py-2 rounded text-sm sm:text-base ${
              activeTab === "shared"
                ? "bg-purple-500 text-white"
                : "bg-gray-200"
            }`}
          >
            Shared With Me
          </button>
        </div>

        {/* TASK LIST */}
        <div className="grid gap-4">
          {filteredTasks.length === 0 ? (
            <p className="text-center text-gray-700">No tasks found</p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => navigate(`/task/${task._id}`)}
                className="border p-3 sm:p-4 rounded-lg shadow-sm bg-white cursor-pointer hover:bg-gray-100 transition"
              >
                <h3 className="font-bold text-base sm:text-lg">
                  {task.title}
                </h3>

                <p className="text-sm sm:text-base text-gray-700">
                  {task.description}
                </p>

                <div className="mt-2 text-xs sm:text-sm text-gray-600 space-y-1">
                  <p>
                    📅{" "}
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString()
                      : "No deadline"}
                  </p>

                  <p>⚡ {task.priority}</p>
                  <p>📌 {task.status}</p>
                </div>

                {/* EXTRA INFO */}
                <div className="mt-2 text-xs sm:text-sm text-gray-500">
                  <p>👤 Created by: {task.createdBy?.name}</p>

                  {task.assignedTo && (
                    <p>📥 Assigned to: {task.assignedTo?.name}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;