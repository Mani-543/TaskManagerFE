import React, { useEffect, useState } from "react";
import API from "../services/api";

function TaskOverview({ setCategoryFilter, refreshKey }) {
  const [data, setData] = useState(null);

  // ---------------- FETCH OVERVIEW ----------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchOverview = async () => {
      try {
        const res = await API.get("/tasks/overview", {
          headers: {
            Authorization: token,
          },
        });

        setData(res.data);
      } catch (err) {
        console.log("Overview error:", err.message);
      }
    };

    fetchOverview();
  }, [refreshKey]);

  if (!data) {
    return (
      <p className="text-center mt-4 text-gray-600">
        Loading Overview...
      </p>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 px-2 md:px-0">

      {/* TITLE */}
      <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
        📊 Task Overview
      </h2>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-green-100 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold text-green-700">
            ✅ Completed
          </p>
          <p className="text-2xl font-bold text-green-800">
            {data.completed}
          </p>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold text-yellow-700">
            🕒 Pending
          </p>
          <p className="text-2xl font-bold text-yellow-800">
            {data.pending}
          </p>
        </div>

        <div className="bg-red-100 p-4 rounded-lg shadow text-center">
          <p className="text-lg font-semibold text-red-700">
            ⚠ Overdue
          </p>
          <p className="text-2xl font-bold text-red-800">
            {data.overdue}
          </p>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="mt-6">
        <h3 className="text-lg md:text-xl font-semibold mb-3 text-gray-800">
          📂 Categories
        </h3>

        <div className="flex flex-wrap gap-2">
          {data.categories &&
            Object.keys(data.categories).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-sm md:text-base"
              >
                {cat} ({data.categories[cat]})
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

export default TaskOverview;