import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

function Comments({ taskId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const chatRef = useRef(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // ================= FETCH =================
  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/tasks/${taskId}/comments`,
        {
          headers: { Authorization: token },
        }
      );
      setComments(res.data);
    } catch (err) {
      console.log(err.message);
    }
  }, [taskId, token]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ================= AUTO SCROLL =================
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [comments]);

  // ================= ADD COMMENT =================
  const addComment = async () => {
    if (!text.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/tasks/${taskId}/comments`,
        { text },
        {
          headers: { Authorization: token },
        }
      );

      setText("");
      fetchComments();
    } catch (err) {
      console.log(err.message);
    }
  };

  return (
    <div className="flex flex-col h-[350px] sm:h-[400px] md:h-[450px] border rounded-lg overflow-hidden">

      {/* CHAT AREA */}
      <div
        ref={chatRef}
        className="flex-1 overflow-y-auto p-2 sm:p-3 bg-gray-100"
      >
        {comments.map((c, i) => {
          const isMe = c.user?._id === userId;

          return (
            <div
              key={i}
              className={`flex mb-2 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-2xl max-w-[75%] sm:max-w-xs break-words ${
                  isMe
                    ? "bg-green-500 text-white"
                    : "bg-white text-black shadow"
                }`}
              >
                {!isMe && (
                  <p className="text-xs font-semibold text-gray-500">
                    {c.user?.name}
                  </p>
                )}

                <p className="text-sm">{c.text}</p>

                <p className="text-[10px] text-right opacity-70 mt-1">
                  {new Date(c.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="flex flex-col sm:flex-row border-t p-2 bg-white gap-2">
        <input
          className="flex-1 border rounded-full px-4 py-2 outline-none text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />

        <button
          onClick={addComment}
          className="bg-green-500 text-white px-4 py-2 rounded-full w-full sm:w-auto"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Comments;