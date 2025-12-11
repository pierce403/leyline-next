'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { CompanySummary } from '@/app/db/companies';

type Props = {
    companies: CompanySummary[];
};

export default function FilteredCompanyList({ companies }: Props) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.location && company.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.type && company.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            {/* Search Input */}
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <FontAwesomeIcon icon={faSearch} className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    placeholder="Filter companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="space-y-8">
                {filteredCompanies.length > 0 ? (
                    filteredCompanies.map((company) => (
                        <div key={company.id} className="group">
                            <Link
                                href={`/companies/${company.id}`}
                                className="block font-bold text-leyline-blue hover:underline text-base mb-1"
                            >
                                {company.name}
                            </Link>
                            <div className="text-sm text-gray-500">
                                {company.location || company.type || 'No location set'}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No companies found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
