import React, { useEffect, useState, useCallback, useRef } from "react";
import API from "../services/api";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Send,
    Loader,
    CheckCircle,
    Trash2,
    Share2,
    Edit2,
} from "lucide-react";

function ChatPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        title: "",
        description: "",
        priority: "",
        status: "",
    });
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [permission, setPermission] = useState("view");
    const [shareLoading, setShareLoading] = useState(false);
    const chatRef = useRef(null);

    const userId = localStorage.getItem("userId");
    const userName = localStorage.getItem("userName");

    const isCreator = task?.createdBy?._id === userId;
    const sharedUser = task?.sharedWith?.find((s) => s.user?._id === userId);
    const canEdit = isCreator || (sharedUser && sharedUser.permission === "edit");

    // ================= FETCH TASK =================
    const fetchTask = useCallback(async () => {
        try {
            const res = await API.get(`/tasks/${taskId}`);
            setTask(res.data);
        } catch (err) {
            console.error("Failed to fetch task:", err.message);
            alert("Task not found");
            navigate("/dashboard");
        }
    }, [taskId, navigate]);

    // ================= FETCH COMMENTS =================
    const fetchComments = useCallback(async () => {
        try {
            const res = await API.get(`/tasks/${taskId}/comments`);
            setComments(res.data || []);
        } catch (err) {
            console.error("Failed to fetch comments:", err.message);
        } finally {
            setLoading(false);
        }
    }, [taskId]);

    // ================= FETCH USERS =================
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await API.get("/users");
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users:", err.message);
            }
        };
        fetchUsers();
    }, []);

    // ================= INITIAL LOAD =================
    useEffect(() => {
        fetchTask();
        fetchComments();
    }, [fetchTask, fetchComments]);

    // ================= AUTO SCROLL =================
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTo({
                top: chatRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [comments]);

    // ================= SEND MESSAGE =================
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await API.post(`/tasks/${taskId}/comments`, { text: message });
            setMessage("");
            await fetchComments();
        } catch (err) {
            console.error("Failed to send message:", err.message);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    // ================= EDIT TASK =================
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
            await API.put(`/tasks/${taskId}`, editForm);
            alert("Task updated ✅");
            setIsEditing(false);
            await fetchTask();
        } catch (err) {
            console.error("Failed to update task:", err.message);
            alert("Failed to save task changes");
        }
    };

    // ================= COMPLETE TASK =================
    const markAsCompleted = async () => {
        try {
            await API.put(`/tasks/${taskId}`, { status: "Completed" });
            await fetchTask();
            alert("Task marked as completed ✅");
        } catch (err) {
            console.error("Failed to complete task:", err.message);
            alert("Failed to complete task");
        }
    };

    // ================= DELETE TASK =================
    const deleteTask = async () => {
        if (window.confirm("Are you sure you want to delete this task? This cannot be undone.")) {
            try {
                await API.delete(`/tasks/${taskId}`);
                alert("Task deleted ✅");
                navigate("/dashboard");
            } catch (err) {
                console.error("Failed to delete task:", err.message);
                alert("Failed to delete task");
            }
        }
    };

    // ================= SHARE TASK =================
    const shareTask = async () => {
        if (!selectedUser) {
            alert("Please select a user");
            return;
        }
        setShareLoading(true);
        try {
            await API.post(`/tasks/${taskId}/share`, {
                userId: selectedUser,
                permission,
            });
            alert("Task shared successfully ✅");
            setSelectedUser("");
            await fetchTask();
        } catch (err) {
            console.error("Failed to share task:", err.message);
            alert("Failed to share task");
        } finally {
            setShareLoading(false);
        }
    };

    // ================= FORMAT TIME =================
    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // ================= FORMAT DATE =================
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4">
                <div className="max-w-md rounded-[28px] bg-slate-900 p-8 shadow-2xl border border-slate-700 text-center">
                    <h2 className="text-3xl font-semibold text-slate-100 mb-3">Task Not Found</h2>
                    <p className="text-sm text-slate-400 mb-6">The task you are looking for may have been removed or is unavailable.</p>
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 py-6">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <button
                        onClick={() => navigate(`/task/${taskId}`)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 shadow-sm transition hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to task
                    </button>

                    {canEdit && (
                        <button
                            onClick={openEdit}
                            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-600"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit task
                        </button>
                    )}

                    <div className="rounded-[28px] bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-5 py-4 text-white shadow-lg">
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Live task conversation</p>
                        <h1 className="mt-2 text-2xl font-semibold text-white tracking-tight">{task.title}</h1>
                        <p className="mt-2 text-sm text-slate-300 max-w-2xl">Keep the team aligned by tracking comments and updates directly on this task.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1.65fr_1fr] gap-6">
                    <section className="space-y-6">
                        <article className="overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900 shadow-sm">
                            <div className="px-5 py-5 sm:px-6 sm:py-6">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Task details</p>
                                        <h2 className="mt-3 text-2xl font-semibold text-slate-100">Task conversation</h2>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                            Collaborate in real time, review progress, and keep task discussions organized on one screen.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${task.status === "Completed"
                                            ? "bg-emerald-700 text-emerald-100"
                                            : task.status === "In Progress"
                                                ? "bg-blue-700 text-blue-100"
                                                : "bg-amber-700 text-amber-100"
                                            }`}>
                                            {task.status}
                                        </span>
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${task.priority === "High"
                                            ? "bg-rose-700 text-rose-100"
                                            : task.priority === "Medium"
                                                ? "bg-orange-700 text-orange-100"
                                                : "bg-slate-700 text-slate-100"
                                            }`}>
                                            {task.priority} priority
                                        </span>
                                        {task.category && (
                                            <span className="inline-flex items-center rounded-full bg-violet-700 px-3 py-1 text-xs font-semibold text-violet-100">
                                                {task.category}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 border-t border-slate-700 px-5 py-5 sm:grid-cols-2 sm:px-6 sm:py-6">
                                <div className="space-y-2 rounded-3xl bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned to</p>
                                    <p className="text-sm font-semibold text-slate-100">{task.assignedTo?.name || task.assignedTo || "Unassigned"}</p>
                                </div>
                                <div className="space-y-2 rounded-3xl bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Due date</p>
                                    <p className="text-sm font-semibold text-slate-100">{task.dueDate ? formatDate(task.dueDate) : "Not set"}</p>
                                </div>
                            </div>
                        </article>

                        {isEditing && canEdit && (
                            <article className="rounded-[28px] border border-slate-700 bg-slate-950 p-6 shadow-sm">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-xl font-semibold text-slate-100">Edit task</h2>
                                        <p className="text-sm text-slate-400">Update the task details directly from chat.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-800"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                <div className="mt-6 space-y-5 text-slate-100">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={editForm.title}
                                            onChange={handleChange}
                                            className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-200 mb-2">Description</label>
                                        <textarea
                                            name="description"
                                            value={editForm.description}
                                            onChange={handleChange}
                                            rows="4"
                                            className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800 resize-none"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-200 mb-2">Priority</label>
                                            <select
                                                name="priority"
                                                value={editForm.priority}
                                                onChange={handleChange}
                                                className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800"
                                            >
                                                <option>Low</option>
                                                <option>Medium</option>
                                                <option>High</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-200 mb-2">Status</label>
                                            <select
                                                name="status"
                                                value={editForm.status}
                                                onChange={handleChange}
                                                className="w-full rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800"
                                            >
                                                <option>Pending</option>
                                                <option>In Progress</option>
                                                <option>Completed</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={saveEdit}
                                            className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            Save changes
                                        </button>
                                    </div>
                                </div>
                            </article>
                        )}

                           <article className="flex h-[720px] flex-col overflow-hidden rounded-[28px] border border-slate-700 bg-slate-900 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4 sm:px-6">
                                <div>
                                    <p className="text-sm font-semibold text-slate-100">Task chat</p>
                                    <p className="text-sm text-slate-400">{comments.length} message{comments.length === 1 ? "" : "s"}</p>
                                </div>
                                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Live</p>
                            </div>

                            <div ref={chatRef} className="min-h-[55vh] overflow-y-auto px-5 py-5 sm:px-6 space-y-5 bg-slate-950">
                                {comments.length === 0 ? (
                                    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-700 bg-slate-950 p-8 text-center">
                                        <p className="text-lg font-semibold text-slate-100 mb-2">No messages yet</p>
                                        <p className="text-sm text-slate-400">Start the conversation about this task to keep everyone aligned.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment, idx) => {
                                            const isOwnMessage = comment.user?._id === userId;
                                            const showDateSeparator =
                                                idx === 0 ||
                                                formatDate(comments[idx - 1]?.createdAt) !== formatDate(comment.createdAt);

                                            return (
                                                <div key={idx}>
                                                    {showDateSeparator && (
                                                        <div className="flex items-center justify-center gap-3 text-xs text-slate-500">
                                                            <span className="h-px flex-1 bg-slate-300"></span>
                                                            <span>{formatDate(comment.createdAt)}</span>
                                                            <span className="h-px flex-1 bg-slate-300"></span>
                                                        </div>
                                                    )}

                                                    <div className={`flex flex-col gap-3 ${isOwnMessage ? "items-end" : "items-start"}`}>
                                                        <div className="flex items-center gap-3">
                                                            {!isOwnMessage && (
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                                                                    {comment.user?.name?.[0] || "?"}
                                                                </div>
                                                            )}
                                                            <div className={`rounded-[28px] px-4 py-3 shadow-sm ${isOwnMessage ? "bg-blue-600 text-white rounded-br-[4px]" : "bg-slate-800 text-slate-100 rounded-bl-[4px] border border-slate-700"}`}>
                                                                <p className="text-sm leading-6">{comment.text}</p>
                                                            </div>
                                                            {isOwnMessage && (
                                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                                                                    {userName?.[0] || "U"}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400">{formatTime(comment.createdAt)}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <form onSubmit={sendMessage} className="border-t border-slate-700 bg-slate-900 px-5 py-5 sm:px-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        disabled={sending}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800 disabled:cursor-not-allowed disabled:bg-slate-900"
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || !message.trim()}
                                        className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                    >
                                        {sending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                    </button>
                                </div>
                            </form>
                        </article>
                    </section>

                    <aside className="space-y-6">
                        <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-semibold text-slate-100">Task snapshot</h2>
                            <p className="mt-3 text-sm text-slate-400">Key task meta for quick reference.</p>

                            <div className="mt-6 space-y-4 text-sm sm:text-base text-slate-300">
                                <div className="rounded-3xl bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Created by</p>
                                    <p className="mt-2 font-medium text-slate-100">{task.createdBy?.name || task.createdBy || "Unknown"}</p>
                                </div>
                                <div className="rounded-3xl bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Deadline</p>
                                    <p className="mt-2 font-medium text-slate-100">{task.dueDate ? formatDate(task.dueDate) : "Not set"}</p>
                                </div>
                                <div className="rounded-3xl bg-slate-950 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Shared with</p>
                                    <p className="mt-2 font-medium text-slate-100">{task.sharedWith?.length || 0} team member{task.sharedWith?.length === 1 ? "" : "s"}</p>
                                </div>
                            </div>
                        </article>

                        <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-100">Quick actions</h2>
                                    <p className="mt-2 text-sm text-slate-400">Manage the task without leaving the chat view.</p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {task.status !== "Completed" && canEdit && (
                                    <button
                                        onClick={markAsCompleted}
                                        type="button"
                                        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                    >
                                        <CheckCircle className="inline-block mr-2 h-4 w-4 align-middle" />
                                        Mark as completed
                                    </button>
                                )}
                                {canEdit && (
                                    <button
                                        onClick={deleteTask}
                                        type="button"
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                                    >
                                        <Trash2 className="inline-block mr-2 h-4 w-4 align-middle" />
                                        Delete task
                                    </button>
                                )}
                            </div>
                        </article>

                        <article className="rounded-[28px] border border-slate-700 bg-slate-900 p-5 shadow-sm sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-slate-100">Share task</h2>
                                    <p className="mt-2 text-sm text-slate-400">Invite a collaborator with view or edit access.</p>
                                </div>
                                <Share2 className="h-5 w-5 text-slate-400" />
                            </div>

                            <div className="mt-5 space-y-4">
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-800"
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setPermission("view")}
                                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${permission === "view" ? "bg-slate-700 text-white" : "bg-slate-950 text-slate-200 hover:bg-slate-800"}`}
                                    >
                                        View access
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPermission("edit")}
                                        className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${permission === "edit" ? "bg-slate-700 text-white" : "bg-slate-950 text-slate-200 hover:bg-slate-800"}`}
                                    >
                                        Edit access
                                    </button>
                                </div>

                                <button
                                    onClick={shareTask}
                                    type="button"
                                    disabled={shareLoading || !selectedUser}
                                    className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {shareLoading ? "Sharing..." : "Share task"}
                                </button>
                            </div>
                        </article>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
