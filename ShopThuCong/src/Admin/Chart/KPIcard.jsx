import React from "react";

export default function KPIcard({
  title,
  value,
  subText,
  loading = false,
}) {
  return (
    <div className="bg-white rounded-xl px-5 py-4 border border-slate-200 shadow-sm 
                    hover:shadow-md transition-all duration-200">
      {/* TITLE */}
      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {title}
      </p>

      {/* VALUE */}
      <p className="text-2xl font-bold text-slate-900 mt-1">
        {loading ? "—" : value}
      </p>

      {/* SUB TEXT */}
      {subText && (
        <p className="text-xs text-emerald-600 mt-2">
          {subText}
        </p>
      )}
    </div>
  );
}
