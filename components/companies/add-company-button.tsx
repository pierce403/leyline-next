'use client';

import { useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom'; // Note: In newer Next.js/React this might be `useActionState`, but keeping to standard for now.
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { createCompany } from "@/app/actions/companies";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
        >
            {pending ? 'Creating...' : 'Create Company'}
        </button>
    );
}

const initialState = {
    message: '',
    errors: {},
};

export default function AddCompanyButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [state, dispatch] = useFormState(createCompany, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        // basic reset if needed, though form state persists
    };

    // If success, close modal
    if (state.message === 'success' && isOpen) {
        setIsOpen(false);
        state.message = ''; // Reset so it doesn't immediately close next time
        // Ideally reset form too
        formRef.current?.reset();
    }

    return (
        <>
            <button
                onClick={openModal}
                className="inline-flex items-center gap-2 rounded border border-sky-400 bg-white px-4 py-1.5 text-sm font-medium text-sky-500 hover:bg-sky-50 transition-colors"
            >
                <FontAwesomeIcon icon={faPlusCircle} className="h-4 w-4" />
                Add New Company
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Add New Company</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={dispatch} ref={formRef} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    placeholder="e.g. Acme Corp"
                                />
                                {state.errors?.name && (
                                    <p className="mt-1 text-xs text-red-600">{state.errors.name[0]}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    placeholder="e.g. San Francisco, CA"
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                    Type / Industry
                                </label>
                                <input
                                    type="text"
                                    id="type"
                                    name="type"
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    placeholder="e.g. Technology"
                                />
                            </div>

                            {state.message && state.message !== 'success' && (
                                <div className="rounded bg-red-50 p-2 text-sm text-red-600">
                                    {state.message}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <SubmitButton />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
