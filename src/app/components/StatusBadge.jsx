export function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const config = {
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pending: "bg-orange-50 text-orange-700 border-orange-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
    acc: "bg-blue-50 text-blue-700 border-blue-200",
  };
  const cls = config[s] || "bg-slate-50 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${cls}`}>
      {status}
    </span>
  );
}
