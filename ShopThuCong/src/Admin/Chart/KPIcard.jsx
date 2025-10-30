import React from "react";

export default function KPIcard({ title, value, badge }) {
  return (
    <div className="bg-[#FFFFFF] p-4 rounded-lg text-black shadow">
      <h3 className="text-sm text-black mb-1">{title}</h3>
      <h2 className="text-2xl font-bold">{value}</h2>
      <p className="text-xs text-green-400 mt-1">{badge}</p>
    </div>
  );
}
