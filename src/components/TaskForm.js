import React, { useEffect, useState } from "react";
import axios from "axios";

function TaskForm({ onTaskAdded }) {
  const [users, setUsers] = useState([]);

  const [task, setTask] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "Low",
    status: "Pending",
    category: "Work",
    assignedTo: "",
    reminder: ""
  });

  const token = localStorage.getItem("token");

  // ---------------- FETCH USERS ----------------
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUsers(res.data);
      } catch (err) {
        console.log("Fetch Users Error:", err.message);
      }
    };

    fetchUsers();
  }, [token]);

  // ---------------- HANDLE CHANGE ----------------
  const handleChange = (e) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/tasks",
        task,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Task Assigned ✅");

      if (onTaskAdded) {
        onTaskAdded();
      }

      setTask({
        title: "",
        description: "",
        deadline: "",
        priority: "Low",
        status: "Pending",
        category: "Work",
        assignedTo: "",
        reminder: ""
      });
    } catch (error) {
      alert("Task creation failed ❌");
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="w-full flex justify-center mt-4 px-2 md:px-0">
      <div className="w-full max-w-2xl bg-yellow-50 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 space-y-5">

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800">
          Create New Task
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Title */}
          <input
            name="title"
            value={task.title}
            placeholder="Title"
            onChange={handleChange}
            required
            className="border rounded-lg p-2 sm:p-3"
          />

          {/* Description */}
          <textarea
            name="description"
            value={task.description}
            placeholder="Description"
            onChange={handleChange}
            rows={3}
            className="border rounded-lg p-2 sm:p-3"
          />

          {/* Deadline + Priority */}
          <div className="flex flex-col md:flex-row gap-4">

            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={task.deadline}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 sm:p-3"
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1 text-sm font-medium">Priority</label>
              <select
                name="priority"
                value={task.priority}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 sm:p-3"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

          </div>

          {/* Assign User */}
          <div>
            <label className="block mb-1 text-sm font-medium">Assign User</label>
            <select
              name="assignedTo"
              value={task.assignedTo}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-2 sm:p-3"
            >
              <option value="">Select User</option>
              {users.length > 0 ? (
                users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))
              ) : (
                <option disabled>No users found</option>
              )}
            </select>
          </div>

          {/* Reminder */}
          <input
            type="datetime-local"
            name="reminder"
            value={task.reminder}
            onChange={handleChange}
            className="border rounded-lg p-2 sm:p-3"
          />

          {/* Button */}
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 sm:py-3 rounded-lg font-semibold transition"
          >
            Create Task
          </button>

        </form>
      </div>
    </div>
  );
}

export default TaskForm;