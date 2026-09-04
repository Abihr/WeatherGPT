import { ShieldOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import Modal from "./Modal";

export default function BlockUserModal({ open, onClose, person }) {
  const { blockUserById } = useApp();
  if (!person) return null;

  function confirm() {
    blockUserById(person);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={`Block ${person.name}?`}>
      <div className="flex items-center gap-3 mb-5">
        <span className="h-11 w-11 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
          <ShieldOff size={20} />
        </span>
        <p className="text-sm text-ink-500">Blocked users cannot:</p>
      </div>
      <ul className="text-sm text-ink-500 space-y-1.5 mb-6 pl-1">
        <li>• Send you friend requests</li>
        <li>• View your shared weather</li>
        <li>• View your location</li>
        <li>• Interact with you</li>
      </ul>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl2 bg-sky-50 text-ink-600 font-medium text-sm hover:bg-sky-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={confirm}
          className="flex-1 py-2.5 rounded-xl2 bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
        >
          Block User
        </button>
      </div>
    </Modal>
  );
}
