import { RefreshCw } from "lucide-react";

export default function RefreshButton() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      className="
        flex items-center gap-2
        px-4 py-2
        rounded-xl
        bg-white
        border border-slate-200
        text-slate-700
        font-medium
        shadow-sm
        hover:bg-slate-50
        hover:shadow
        transition
      "
    >
      <RefreshCw size={18} />
      Refresh
    </button>
  );
}