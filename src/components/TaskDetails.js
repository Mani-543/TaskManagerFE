import { useState } from "react";
import axios from "axios";

const TaskDetails = ({ taskId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      await axios.post(
        `http://localhost:5000/api/tasks/${taskId}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("File uploaded successfully ✅");
      setFile(null);
    } catch (err) {
      console.log(err.message);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mt-4 bg-white shadow-sm">

      {/* TITLE */}
      <h3 className="font-bold mb-3 text-lg">
        📎 Upload File for Task
      </h3>

      {/* FILE INPUT + BUTTON */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">

        {/* INPUT */}
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full sm:w-auto border rounded px-3 py-2 text-sm"
        />

        {/* BUTTON */}
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {/* FILE NAME PREVIEW */}
      {file && (
        <p className="text-sm text-gray-600 mt-2 truncate">
          Selected: {file.name}
        </p>
      )}
    </div>
  );
};

export default TaskDetails;