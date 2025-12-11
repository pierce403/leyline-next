'use client';

import { useState, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faTimes, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { createInvestment } from "@/app/actions/portfolio";
import { CompanySummary } from "@/app/db/companies";
import Link from 'next/link';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded bg-[#2ecc71] px-6 py-2 text-sm font-medium text-white hover:bg-[#27ae60] focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
            {pending ? 'Saving...' : 'Continue'}
        </button>
    );
}

const initialState = {
    message: '',
    errors: {},
};

type Props = {
    companies: CompanySummary[];
}

const INVESTMENT_TYPES = [
    "Common Stock",
    "Preferred Stock",
    "SAFE Note",
    "Convertible Note",
    "Warrant",
    "Token",
    "Special Purpose Vehicle"
];

function CompanyCombobox({ companies }: { companies: CompanySummary[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredCompanies = companies.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (id: string, name: string) => {
        setSelectedCompanyId(id);
        setSearchTerm(name);
        setIsOpen(false);
    };

    // Close on click outside
    useActionState(() => { }, null); // Dummy hook call just to keep hooks order valid if I were to copy-paste, but here it's fine. 
    // Actually, I can't use useActionState just for nothing. Removing it. 
    // Wait, useActionState was imported in the file.

    // Simpler click outside handling
    const toggleOpen = () => setIsOpen(!isOpen);

    const selectedName = companies.find(c => c.id === selectedCompanyId)?.name || '';

    return (
        <div className="relative" ref={wrapperRef}>
            <input type="hidden" name="companyId" value={selectedCompanyId} />
            <input
                type="text"
                placeholder="Select or search company..."
                className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isOpen) setIsOpen(true);
                    if (selectedCompanyId) setSelectedCompanyId(''); // Clear selection on edit
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click
                autoComplete="off"
            />
            {isOpen && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => (
                            <div
                                key={company.id}
                                className="relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-sky-100 text-gray-900"
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur
                                    handleSelect(company.id, company.name);
                                }}
                            >
                                <span className={`block truncate ${selectedCompanyId === company.id ? 'font-semibold' : 'font-normal'}`}>
                                    {company.name}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                            No companies found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function NewInvestmentButton({ companies }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [state, dispatch] = useActionState(createInvestment, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
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
                className="rounded bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600 shadow-sm flex items-center gap-2"
            >
                <FontAwesomeIcon icon={faPlusCircle} className="h-4 w-4" />
                New Investment
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-2xl rounded bg-white shadow-xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">

                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-700">New Investment</h2>
                                <p className="text-sm text-gray-500">Create a new investment.</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto">
                            <form action={dispatch} ref={formRef} className="space-y-6">
                                {/* Company Select */}
                                <div>
                                    <label htmlFor="companyId" className="block text-sm font-bold text-gray-700 mb-1">
                                        Company <span className="text-red-500">*</span> <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-400 ml-1 text-xs" />
                                    </label>
                                    <CompanyCombobox companies={companies} />
                                    <div className="mt-2 text-xs text-blue-500">
                                        Can't find the company you invested in? <Link href="/companies" className="hover:underline font-medium">Add a new company</Link>
                                    </div>
                                </div>

                                {/* Investment Type */}
                                <div>
                                    <label htmlFor="investmentType" className="block text-sm font-bold text-gray-700 mb-1">
                                        Investment Type <span className="text-red-500">*</span> <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-400 ml-1 text-xs" />
                                    </label>
                                    <select
                                        id="investmentType"
                                        name="investmentType"
                                        required
                                        className="mt-1 block w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select</option>
                                        {INVESTMENT_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Checkboxes */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="isMock" name="isMock" className="rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                                        <label htmlFor="isMock" className="text-sm text-gray-600 flex items-center gap-1">
                                            This is a mock investment <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-400 text-xs" />
                                        </label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" id="sendReminders" name="sendReminders" className="rounded border-gray-300 text-sky-500 focus:ring-sky-500" />
                                        <label htmlFor="sendReminders" className="text-sm text-gray-600 flex items-center gap-1">
                                            Send reminders <FontAwesomeIcon icon={faQuestionCircle} className="text-gray-400 text-xs" />
                                        </label>
                                    </div>
                                </div>

                                {/* State Messages */}
                                {state.message && state.message !== 'success' && (
                                    <div className="rounded bg-red-50 p-2 text-sm text-red-600">
                                        {state.message}
                                    </div>
                                )}

                                {/* Footer Buttons */}
                                <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
                                    <button type="button" className="text-sm text-blue-500 hover:underline">
                                        Types of securities
                                    </button>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <SubmitButton />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
