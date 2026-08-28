"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

interface Props {
  action: () => Promise<{ success: boolean; message?: string; error?: string }>;
}

export default function CleanDbClientButton({ action }: Props) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmClean = async () => {
    setLoading(true);
    try {
      const res = await action();
      if (res.success) {
        toast.success(res.message || "Database cleaned successfully!");
        setShowModal(false);
      } else {
        toast.error(res.error || "Failed to clean database.");
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-semibold text-sm transition-all hover:-translate-y-px disabled:opacity-50 cursor-pointer"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
        Clean Database
      </button>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmClean}
        title="Clean Database?"
        message="Are you sure you want to clean all leads and call logs from the database? This cannot be undone."
        confirmText="Clean Database"
        cancelText="Cancel"
        variant="danger"
        isLoading={loading}
      />
    </>
  );
}

