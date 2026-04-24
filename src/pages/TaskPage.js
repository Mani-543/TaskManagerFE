import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import TaskDetails from "../components/TaskDetails";
import Comments from "../components/Comments";

function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const userId = localStorage.getItem("userId");

  // ✅ PERMISSIONS
  const isCreator = task?.createdBy?._id === userId;

  const sharedUser = task?.sharedWith?.find(
    (s) => s.user?._id === userId
  );

  const canEdit =
    isCreator ||
    (sharedUser && sharedUser.permission === "edit");

  // SHARE STATES
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState("view");

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
  });

  // ================= FETCH TASK =================
  const fetchTask = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const found = res.data.find((t) => t._id === id);
      setTask(found);
    } catch (err) {
      console.log(err.message);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUsers(res.data);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchUsers();
  }, []);

  // ================= EDIT =================
  const openEdit = () => {
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
    });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        editForm,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Task updated ✅");
      setIsEditing(false);
      fetchTask();
    } catch (err) {
      console.log(err.message);
    }
  };

  // ================= COMPLETE =================
  const markAsCompleted = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/tasks/${id}`,
        { status: "Completed" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Task completed ✅");
      fetchTask();
    } catch (err) {
      console.log(err.message);
    }
  };

  // ================= SHARE =================
  const shareTask = async () => {
    try {
      if (!selectedUser) return alert("Select user");

      await axios.post(
        `http://localhost:5000/api/tasks/${id}/share`,
        { userId: selectedUser, permission },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Task Shared ✅");
    } catch (err) {
      console.log(err.message);
    }
  };

  // ================= DELETE =================
  const deleteTask = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Task deleted 🗑️");
      navigate("/dashboard");
    } catch (err) {
      console.log(err.message);
    }
  };

  if (!task)
    return (
      <div className="flex justify-center p-4">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 bg-gradient-to-r from-purple-300 via-pink-500 to-yellow-300 rounded-lg">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
          📋 {task.title}
        </h1>

        {/* ACTIONS */}
        <div className="flex flex-wrap gap-2">

          {canEdit && (
            <button
              onClick={openEdit}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded-lg text-sm md:text-base"
            >
              Edit
            </button>
          )}

          {canEdit && task.status !== "Completed" && (
            <button
              onClick={markAsCompleted}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm md:text-base"
            >
              Complete
            </button>
          )}

          {isCreator && (
            <button
              onClick={deleteTask}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm md:text-base"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* DETAILS + EDIT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* DETAILS */}
        <div className="bg-yellow-100 p-4 sm:p-5 rounded-lg w-full">
          <h2 className="font-semibold mb-3 text-base sm:text-lg">
            Details
          </h2>

          <div className="space-y-2 text-sm sm:text-base">
            <p className="break-words">
              <b>Description:</b>{" "}
              <span className="block sm:inline">
                {task.description}
              </span>
            </p>

            <p>
              <b>Deadline:</b>{" "}
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : "No deadline"}
            </p>

            <p>
              <b>Priority:</b>{" "}
              <span className="capitalize">{task.priority}</span>
            </p>

            <p>
              <b>Status:</b>{" "}
              <span className="capitalize">{task.status}</span>
            </p>
          </div>
        </div>

        {/* EDIT */}
        {isEditing && canEdit && (
          <div className="bg-pink-100 p-4 rounded-lg space-y-3">
            <input name="title" value={editForm.title} onChange={handleChange} className="w-full p-2 rounded border" />
            <textarea name="description" value={editForm.description} onChange={handleChange} className="w-full p-2 rounded border" />
            <select name="priority" value={editForm.priority} onChange={handleChange} className="w-full p-2 rounded border">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <select name="status" value={editForm.status} onChange={handleChange} className="w-full p-2 rounded border">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>

            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={saveEdit} className="bg-blue-600 text-white px-3 py-2 rounded">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-3 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* COMMENTS + FILE */}
      <div className="space-y-6">
        <TaskDetails taskId={id} />
        <Comments taskId={id} />
      </div>

      {/* SHARE */}
      {isCreator && (
        <div className="mt-6 bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Share Task</h3>

          <div className="flex flex-col md:flex-row gap-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="">Select User</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>

            <button
              onClick={shareTask}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskPage;