'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { deleteCompany } from "@/app/actions/delete-company";

export default function DeleteCompanyButton({ companyId }: { companyId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this company? This action cannot be undone.")) {
            setIsDeleting(true);
            await deleteCompany(companyId);
            // Logic after delete is handled by the server action (redirect)
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
            {isDeleting ? 'Deleting...' : 'Delete Company'}
        </button>
    );
}
