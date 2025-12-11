'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteInvestment } from "@/app/actions/delete-investment";

export default function DeleteInvestmentButton({ investmentId }: { investmentId: string }) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        await deleteInvestment(investmentId);
        // Redirect handled by server action, but state update prevents double click
    };

    if (isConfirming) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-red-600 font-medium">Are you sure?</span>
                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                    {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                    onClick={() => setIsConfirming(false)}
                    disabled={isDeleting}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsConfirming(true)}
            className="flex items-center gap-2 rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors"
        >
            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
            Delete Investment
        </button>
    );
}
