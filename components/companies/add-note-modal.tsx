'use client';

import { useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStickyNote, faTimes } from "@fortawesome/free-solid-svg-icons";
import { addNote } from "@/app/actions/add-note";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50"
        >
            {pending ? 'Adding...' : 'Add Note'}
        </button>
    );
}

const initialState = {
    message: '',
    errors: {},
};

export default function AddNoteModal({ companyId }: { companyId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const bindAddNote = addNote.bind(null, companyId);
    const [state, dispatch] = useFormState(bindAddNote, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        if (state.message) state.message = '';
    };

    if (state.message === 'success' && isOpen) {
        setIsOpen(false);
        state.message = '';
        formRef.current?.reset();
    }

    return (
        <>
            <button
                onClick={openModal}
                className="flex items-center gap-2 rounded border border-sky-400 bg-white px-3 py-1.5 text-xs font-medium text-sky-500 hover:bg-sky-50 transition-colors"
            >
                <FontAwesomeIcon icon={faStickyNote} className="h-3 w-3" />
                New Note
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Add New Note</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={dispatch} ref={formRef} className="space-y-4">
                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                    Note Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    required
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                    placeholder="Enter your note here..."
                                />
                                {state.errors?.content && (
                                    <p className="mt-1 text-xs text-red-600">{state.errors.content[0]}</p>
                                )}
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
