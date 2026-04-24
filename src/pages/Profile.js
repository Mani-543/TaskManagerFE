import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
  });

  const token = localStorage.getItem("token");

  // ================= FETCH PROFILE =================
  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/tasks/profile",
        {
          headers: { Authorization: token },
        }
      );

      setUser(res.data);
      setForm({
        name: res.data.name,
        email: res.data.email,
      });
    } catch (err) {
      console.log(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SAVE PROFILE =================
  const saveProfile = async () => {
    try {
      const res = await axios.put(
        "http://localhost:5000/api/tasks/profile",
        form,
        {
          headers: { Authorization: token },
        }
      );

      setUser(res.data);
      setEditMode(false);
      alert("Profile updated successfully ✅");
    } catch (err) {
      console.log(err.message);
    }
  };

  if (!user) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Loading...
      </p>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      
      <div className="w-full max-w-lg bg-yellow-100 rounded-xl shadow-lg p-5 md:p-8 transition hover:shadow-xl">

        {/* TITLE */}
        <h2 className="text-xl md:text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
          👤 Profile
        </h2>

        {/* EDIT MODE */}
        {editMode ? (
          <div className="space-y-4">

            <div>
              <label className="text-sm text-gray-600">Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border rounded-md p-2 md:p-3 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border rounded-md p-2 md:p-3 mt-1 focus:ring-2 focus:ring-blue-300 outline-none"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={saveProfile}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
              >
                Save
              </button>

              <button
                onClick={() => setEditMode(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            {/* USER INFO */}
            <div className="bg-white p-4 rounded-lg shadow text-sm md:text-base">
              <p><b>Name:</b> {user.name}</p>
              <p><b>Email:</b> {user.email}</p>
            </div>

            {/* EDIT BUTTON */}
            <button
              onClick={() => setEditMode(true)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md"
            >
              Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;