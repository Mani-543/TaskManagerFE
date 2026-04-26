import { useState } from "react";
import API from "../services/api";

const TaskDetails = ({ taskId, task }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const res = await API.post(
        `/tasks/${taskId}/upload`,
        formData
      );

      console.log(res.data);
      alert("File uploaded successfully ✅");
      setFile(null);

      // quick refresh (so file appears)
      window.location.reload();

    } catch (err) {
      console.log("UPLOAD ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload Failed.. ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4 bg-white shadow-sm">
      <h3 className="font-bold mb-3 text-lg">📎 Upload File for Task</h3>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full sm:w-auto border rounded px-3 py-2 text-sm"
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {file && (
        <p className="text-sm text-gray-600 mt-2">
          Selected: {file.name}
        </p>
      )}

      {/* ✅ SHOW FILE */}
      {task?.file && (
        <div className="mt-4">
          <p className="text-sm font-semibold">📂 Uploaded File:</p>

          <a
            href={task.file}
            target="_blank"
            rel="noreferrer"
            className="text-blue-500 underline"
          >
            View File
          </a>
        </div>
      )}
    </div>
  );
};

export default TaskDetails;