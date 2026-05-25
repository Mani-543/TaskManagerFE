import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function ProgressPage() {
  const [tasks, setTasks] = useState([]);

  // ================= FETCH TASKS =================
  const fetchTasks = useCallback(async () => {
    try {
      const res = await API.get("/tasks", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      });

      setTasks(res.data);
    } catch (err) {
      console.log(err.message);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ================= STATS =================
  const completed = tasks.filter(
    (t) => t.status === "Completed"
  ).length;

  const pending = tasks.filter(
    (t) => t.status === "Pending"
  ).length;

  const inProgress = tasks.filter(
    (t) => t.status === "In Progress"
  ).length;

  const total = tasks.length;

  const progress =
    total === 0 ? 0 : (completed / total) * 100;

  // ================= DATA =================
  const data = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
    { name: "In Progress", value: inProgress },
  ];

  const COLORS = ["#4ade80", "#facc15", "#60a5fa"];

  return (
    <div className="min-h-screen bg-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">

          <h1 className="text-xl md:text-2xl font-bold mb-6">
            📊 Progress & Reports
          </h1>

          {/* PROGRESS BAR */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="mt-2 text-sm text-gray-600">
              Completed {completed} / {total} (
              {progress.toFixed(0)}%)
            </p>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PIE CHART */}
            <div className="bg-purple-200 p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-3 text-center">
                Task Distribution
              </h2>

              <div className="w-full h-[250px] min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={90}
                    >
                      {data.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* BAR CHART */}
            <div className="bg-purple-200 p-4 rounded-lg shadow">
              <h2 className="font-semibold mb-3 text-center">
                Task Overview
              </h2>

              <div className="w-full h-[250px] min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Bar
                      dataKey="value"
                      fill="#4ade80"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressPage;