import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api"; // ✅ FIX
import { useParams, useNavigate } from "react-router-dom";
import Comments from "../components/Comments";

function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const userId = localStorage.getItem("userId");

  const isCreator = task?.createdBy?._id === userId;

  const sharedUser = task?.sharedWith?.find(
    (s) => s.user?._id === userId
  );

  const canEdit =
    isCreator ||
    (sharedUser && sharedUser.permission === "edit");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState("view");

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
  });

  // ✅ FETCH TASK
  const fetchTask = useCallback(async () => {
    try {
      const res = await API.get("/tasks"); // ✅ FIX
      const found = res.data.find((t) => t._id === id);
      setTask(found);
    } catch (err) {
      console.log(err.message);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  // ✅ FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users"); // ✅ FIX
        setUsers(res.data);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchUsers();
  }, []);

  // ✅ SAVE EDIT
  const saveEdit = async () => {
    try {
      await API.put(`/tasks/${id}`, editForm); // ✅ FIX
      alert("Task updated ✅");
      setIsEditing(false);
      fetchTask();
    } catch (err) {
      console.log(err.message);
    }
  };

  // ✅ COMPLETE
  const markAsCompleted = async () => {
    try {
      await API.put(`/tasks/${id}`, { status: "Completed" }); // ✅ FIX
      fetchTask();
    } catch (err) {
      console.log(err.message);
    }
  };

  // ✅ SHARE
  const shareTask = async () => {
    try {
      await API.post(`/tasks/${id}/share`, {
        userId: selectedUser,
        permission,
      }); // ✅ FIX

      alert("Task Shared ✅");
    } catch (err) {
      console.log(err.message);
    }
  };

  // ✅ DELETE
  const deleteTask = async () => {
    try {
      await API.delete(`/tasks/${id}`); // ✅ FIX
      navigate("/dashboard");
    } catch (err) {
      console.log(err.message);
    }
  };


  // ================= OPEN EDIT =================
const openEdit = () => {
  setEditForm({
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
  });
  setIsEditing(true);
};

// ================= HANDLE CHANGE =================
const handleChange = (e) => {
  setEditForm({
    ...editForm,
    [e.target.name]: e.target.value,
  });
};
  if (!task) return <p>Loading...</p>;
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10 bg-gradient-to-r from-purple-300 via-pink-500 to-yellow-300 rounded-lg">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
          📋 {task.title}
        </h1>

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

        <div className="bg-yellow-100 p-4 sm:p-5 rounded-lg w-full">
          <h2 className="font-semibold mb-3 text-base sm:text-lg">
            Details
          </h2>

          <div className="space-y-2 text-sm sm:text-base">
            <p><b>Description:</b> {task.description}</p>

            <p>
              <b>Deadline:</b>{" "}
              {task.deadline
                ? new Date(task.deadline).toLocaleDateString()
                : "No deadline"}
            </p>

            <p><b>Priority:</b> {task.priority}</p>
            <p><b>Status:</b> {task.status}</p>
          </div>
        </div>

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

      <div className="space-y-6">
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