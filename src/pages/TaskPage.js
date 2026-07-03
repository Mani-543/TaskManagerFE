import React, { useEffect, useState, useCallback } from "react";
import API from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageCircle, AlertCircle, Tag } from "lucide-react";

function TaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  const isCreator = task?.createdBy?._id === userId;
  const sharedUser = task?.sharedWith?.find((s) => s.user?._id === userId);
  const canEdit = isCreator || (sharedUser && sharedUser.permission === "edit");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [permission, setPermission] = useState("view");

  const fetchTask = useCallback(async () => {
    try {
      const res = await API.get(`/tasks/${id}`);
      setTask(res.data);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchUsers();
  }, []);

  const markAsCompleted = async () => {
    try {
      await API.put(`/tasks/${id}`, { status: "Completed" });
      fetchTask();
    } catch (err) {
      console.log(err.message);
    }
  };

  const shareTask = async () => {
    if (!selectedUser) {
      alert("Please select a user");
      return;
    }
    try {
      await API.post(`/tasks/${id}/share`, {
        userId: selectedUser,
        permission,
      });
      alert("Task shared ✅");
      setSelectedUser("");
      fetchTask();
    } catch (err) {
      console.log(err.message);
    }
  };

  const deleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/tasks/${id}`);
        navigate("/dashboard");
      } catch (err) {
        console.log(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
        <div className="rounded-[28px] bg-slate-900 p-8 shadow-2xl text-center border border-slate-700">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-blue-600 mx-auto mb-5"></div>
          <p className="text-slate-100 text-base">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
        <div className="max-w-md rounded-[28px] bg-slate-900 p-8 shadow-2xl border border-slate-700 text-center">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-400" />
          <h2 className="text-2xl font-semibold text-slate-100 mb-3">Task Not Found</h2>
          <p className="text-sm text-slate-400 mb-6">The task may have been deleted or is unavailable.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center justify-center rounded-full bg-slate-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="sticky top-0 z-20 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-slate-100">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-slate-100 shadow-sm transition hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Task details</p>
              <h1 className="text-2xl font-semibold text-slate-100 sm:text-3xl">{task.title}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={() => navigate(`/task/${id}/chat`)}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <MessageCircle className="h-4 w-4" />
              Open Chat
            </button>
            {canEdit && task.status !== "Completed" && (
              <button
                onClick={markAsCompleted}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Complete
              </button>
            )}
            {isCreator && (
              <button
                onClick={deleteTask}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.95fr]">
          <section className="space-y-6">
            <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-6 shadow-sm">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overview</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-100">Task summary</h2>
                  <p className="mt-2 max-w-2xl text-sm text-slate-400">
                    Review the main task details, timeline, and ownership in one clean panel.
                  </p>
                </div>
                <div className="inline-flex flex-wrap items-center gap-3 rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-200">
                  <span className="text-slate-400">Created by</span>
                  <span className="text-slate-100">{task.createdBy?.name || task.createdBy || "Unknown"}</span>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Deadline</p>
                  <p className="mt-3 text-base font-semibold text-slate-100">
                    {task.deadline
                      ? new Date(task.deadline).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                      : "Not set"}
                  </p>
                </div>
                <div className="rounded-[24px] bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assigned To</p>
                  <p className="mt-3 text-base font-semibold text-slate-100">{task.assignedTo?.name || (typeof task.assignedTo === "string" ? task.assignedTo : "Unassigned")}</p>
                </div>
                <div className="rounded-[24px] bg-slate-9950 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Status</p>
                  <p className="mt-3 text-base font-semibold text-slate-100">{task.status}</p>
                </div>
                <div className="rounded-[24px] bg-slate-950 p-5">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Priority</p>
                  <p className="mt-3 text-base font-semibold text-slate-900">{task.priority}</p>
                </div>
              </div>
            </article>

            <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">Description</h2>
                  <p className="text-sm text-slate-400">A clear view of the task purpose and requirements.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-3 py-2 text-sm font-semibold text-violet-100">
                  <Tag className="h-4 w-4" />
                  {task.category || "No category"}
                </div>
              </div>
              <p className="mt-5 text-slate-100 leading-7 whitespace-pre-wrap">
                {task.description || "No description provided for this task."}
              </p>
            </article>

          </section>

          <aside className="space-y-6">
            <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-100">Quick Summary</h2>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Created by</p>
                  <p className="mt-2 font-semibold text-slate-100">{task.createdBy?.name || task.createdBy || "Unknown"}</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Deadline</p>
                  <p className="mt-2 font-semibold text-slate-100">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "Not set"}</p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Assigned to</p>
                  <p className="mt-2 font-semibold text-slate-100">{task.assignedTo?.name || task.assignedTo || "Unassigned"}</p>
                </div>
              </div>
            </article>

            {task.sharedWith && task.sharedWith.length > 0 && (
              <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-100">Shared with</h2>
                <div className="mt-4 space-y-3 text-slate-300">
                  {task.sharedWith.map((share, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-3xl bg-slate-950 p-4">
                      <span className="font-medium text-slate-100">{share.user?.name}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${share.permission === "edit" ? "bg-blue-700 text-blue-100" : "bg-slate-700 text-slate-200"}`}>
                        {share.permission === "edit" ? "Can edit" : "View only"}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {isCreator && (
              <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">Share task</h2>
                    <p className="text-sm text-slate-400">Invite a teammate with view or edit access.</p>
                  </div>
                  <MessageCircle className="h-5 w-5 text-slate-400" />
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-200 block mb-2">Select user</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800"
                    >
                      <option value="">Choose a user...</option>
                      {users.map((u) => (
                        <option key={u._id} value={u._id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-200 block mb-2">Permission</label>
                    <select
                      value={permission}
                      onChange={(e) => setPermission(e.target.value)}
                      className="w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800"
                    >
                      <option value="view">View only</option>
                      <option value="edit">Can edit</option>
                    </select>
                  </div>

                  <button
                    onClick={shareTask}
                    className="w-full rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Share task
                  </button>
                </div>
              </article>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default TaskPage;
