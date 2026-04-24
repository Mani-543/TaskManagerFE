import React, { useEffect, useState } from "react";
import axios from "axios";

function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        });

        setTasks(res.data);
      } catch (err) {
        console.log("Error fetching tasks:", err.message);
      }
    };

    fetchTasks();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 px-2 md:px-0">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">
        📋 Task List
      </h3>

      {tasks.length === 0 ? (
        <p className="text-gray-600">No tasks found</p>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
            >
              {/* Title */}
              <h4 className="text-lg md:text-xl font-semibold text-gray-800">
                {task.title}
              </h4>

              {/* Description */}
              <p className="text-gray-600 mt-1 text-sm md:text-base">
                {task.description || "No description"}
              </p>

              {/* Info Row */}
              <div className="flex flex-col sm:flex-row sm:justify-between mt-3 text-sm text-gray-500 gap-2">
                <span>📌 {task.status}</span>

                {task.priority && (
                  <span>⚡ {task.priority}</span>
                )}

                {task.deadline && (
                  <span>
                    📅 {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              {/* Optional creator */}
              {task.createdBy && (
                <p className="text-xs text-gray-400 mt-2">
                  👤 {task.createdBy.name}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TaskList;