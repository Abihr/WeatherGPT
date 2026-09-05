import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserPlus, Inbox } from "lucide-react";
import { useApp } from "../context/AppContext";
import FriendCard from "../components/FriendCard";
import AddFriendModal from "../components/AddFriendModal";
import BlockUserModal from "../components/BlockUserModal";
import EmptyState from "../components/EmptyState";

export default function Friends() {
  const { friendsList, received } = useApp();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);

  const filtered = friendsList.filter((f) => {
    const t = term.trim().toLowerCase();
    if (!t) return true;
    return f.name.toLowerCase().includes(t) || f.username.toLowerCase().includes(t);
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-10 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-display font-extrabold text-ink-900">My Weather Circle</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setAddOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors"
        >
          <UserPlus size={15} /> Add Friend
        </button>
        <button
          onClick={() => navigate("/requests")}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors relative"
        >
          <Inbox size={15} /> Friend Requests
          {received.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-sun-400 text-white text-[10px] font-bold flex items-center justify-center">
              {received.length}
            </span>
          )}
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-white shadow-card rounded-full pl-10 pr-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-sky-300 transition-shadow"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="👥"
          title={friendsList.length === 0 ? "No friends yet" : "No matches"}
          message={
            friendsList.length === 0
              ? "Add friends to start comparing weather and sharing your location."
              : "Try a different name or username."
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((f) => (
            <FriendCard
              key={f.id}
              friend={f}
              onCompare={() => navigate("/compare", { state: { friendId: f.id } })}
              onBlock={setBlockTarget}
            />
          ))}
        </div>
      )}

      <AddFriendModal open={addOpen} onClose={() => setAddOpen(false)} />
      <BlockUserModal open={!!blockTarget} onClose={() => setBlockTarget(null)} person={blockTarget} />
    </div>
  );
}
