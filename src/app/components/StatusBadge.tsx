export function StatusBadge({ status }: { status: string }) {
  const s = status ? status.toLowerCase() : "";
  let baseStyle = "px-2 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1.5 w-fit uppercase tracking-wide";
  let dotStyle = "w-1.5 h-1.5 rounded-full shadow-sm";
  
  if (s === "approved" || s === "acc") {
    baseStyle += " bg-emerald-50 text-emerald-600";
    dotStyle += " bg-emerald-500";
  } else if (s === "pending") {
    baseStyle += " bg-amber-50 text-amber-600";
    dotStyle += " bg-amber-500";
  } else {
    baseStyle += " bg-rose-50 text-rose-600";
    dotStyle += " bg-rose-500";
  }

  return (
    <div className={baseStyle}>
      <div className={dotStyle} />
      {status || "Unknown"}
    </div>
  );
}
