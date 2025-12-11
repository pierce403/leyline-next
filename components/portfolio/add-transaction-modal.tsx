'use client';

import { useState, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTimes } from "@fortawesome/free-solid-svg-icons";
import { addTransaction } from "@/app/actions/add-transaction";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded bg-[#2ecc71] px-4 py-2 text-sm font-medium text-white hover:bg-[#27ae60] focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
            {pending ? 'Saving...' : 'Save Transaction'}
        </button>
    );
}

const initialState = {
    message: '',
    errors: {},
};

const TRANSACTION_TYPES = [
    "Buy",
    "Sell",
    "Exercise",
    "Dividend Reinvestment",
    "Return of Capital",
    "Interest",
    "Dividend"
];

export default function AddTransactionModal({ investmentId }: { investmentId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const bindAddTransaction = addTransaction.bind(null, investmentId);
    const [state, dispatch] = useFormState(bindAddTransaction, initialState);
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
                className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-100 active:scale-95 transition-transform"
            >
                <FontAwesomeIcon icon={faPlusCircle} className="h-3 w-3" />
                New Transaction
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">New Transaction</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                            </button>
                        </div>

                        <form action={dispatch} ref={formRef} className="space-y-4">
                            <div>
                                <label htmlFor="transactionType" className="block text-sm font-medium text-gray-700">
                                    Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="transactionType"
                                    name="transactionType"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                                >
                                    <option value="" disabled selected>Select type</option>
                                    {TRANSACTION_TYPES.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="occurredAt" className="block text-sm font-medium text-gray-700">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="occurredAt"
                                    name="occurredAt"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                                        Amount ($) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="amount"
                                        name="amount"
                                        required
                                        step="0.01"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                        Quantity (Shares)
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        step="0.0001"
                                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        placeholder="0"
                                    />
                                </div>
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
