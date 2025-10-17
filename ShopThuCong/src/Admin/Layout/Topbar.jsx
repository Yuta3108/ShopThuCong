import React from "react";

export default function Topbar() {
  return (
    <div className="flex justify-between items-center bg-gray-800 text-gray-100 p-4 rounded-lg mb-4">
      <h2 className="text-lg font-semibold">Dashboard Overview</h2>
      <input
        type="text"
        placeholder="Search..."
        className="bg-gray-700 px-3 py-1 rounded focus:outline-none"
      />
    </div>
  );
}
