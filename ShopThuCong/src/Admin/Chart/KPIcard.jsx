export default function KPIcard({ title, value, badge }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 py-4 shadow-sm hover:shadow-md transition-all">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-emerald-600 mt-2">{badge}</p>
    </div>
  );
}
