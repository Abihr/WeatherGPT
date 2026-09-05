import { useState } from "react";
import { Search, MapPin, Check, UserPlus } from "lucide-react";
import { useApp } from "../context/AppContext";
import Modal from "./Modal";

export default function AddFriendModal({ open, onClose }) {
  const { searchUsers, sendRequest } = useApp();
  const [term, setTerm] = useState("");
  const results = searchUsers(term);

  return (
    <Modal open={open} onClose={onClose} title="Add Friend">
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-sky-50 rounded-full pl-10 pr-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-400 outline-none focus:ring-2 focus:ring-sky-300 transition-shadow"
        />
      </div>

      {term.trim() === "" && (
        <p className="text-sm text-ink-400 text-center py-8">Search by name or @username to find people.</p>
      )}

      {term.trim() !== "" && results.length === 0 && (
        <p className="text-sm text-ink-400 text-center py-8">No users found for "{term}".</p>
      )}

      <div className="flex flex-col gap-2">
        {results.map((person) => (
          <div key={person.id} className="flex items-center gap-3 p-2.5 rounded-xl2 hover:bg-sky-50 transition-colors">
            <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-700 font-display font-semibold flex items-center justify-center text-sm shrink-0">
              {person.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-800 truncate">{person.name}</p>
              <p className="text-xs text-ink-400">@{person.username}</p>
              <p className="text-xs text-ink-400 flex items-center gap-1"><MapPin size={10} /> {person.location}</p>
            </div>
            {person.isFriend ? (
              <span className="text-xs font-medium text-sky-600 flex items-center gap-1 shrink-0">
                <Check size={13} /> Friends
              </span>
            ) : person.isPending ? (
              <span className="text-xs font-medium text-sun-500 shrink-0">Request Sent</span>
            ) : (
              <button
                onClick={() => sendRequest(person)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors flex items-center gap-1 shrink-0"
              >
                <UserPlus size={12} /> Add Friend
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
