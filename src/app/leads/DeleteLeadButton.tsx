"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteLeadAndHistory } from "@/actions/lead.actions";
import toast from "react-hot-toast";
import ConfirmModal from "@/components/ConfirmModal";

export default function DeleteLeadButton({ leadId }: { leadId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    toast.loading("Deleting lead...", { id: "delete-lead" });

    const result = await deleteLeadAndHistory(leadId);

    if (result.success) {
      toast.success("Lead deleted successfully", { id: "delete-lead" });
      setShowModal(false);
      if (window.location.pathname !== "/leads") {
        window.location.href = "/leads";
      }
    } else {
      toast.error(result.error || "Failed to delete lead", { id: "delete-lead" });
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isDeleting}
        className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
        title="Delete Lead"
      >
        <Trash2 size={16} />
      </button>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead & History?"
        message="Are you sure you want to permanently delete this lead and its entire call history? This action cannot be undone."
        confirmText="Delete Lead"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

