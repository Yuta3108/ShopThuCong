import React from "react";

export default function KPIcard({ title, value, badge }) {
  return (
    <div className="bg-gray-800 p-4 rounded-lg text-gray-200 shadow">
      <h3 className="text-sm text-gray-400 mb-1">{title}</h3>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-xs text-green-400 mt-1">{badge}</p>
    </div>
  );
}
