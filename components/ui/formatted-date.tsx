'use client';

import { useEffect, useState } from 'react';

type FormattedDateProps = {
    date: Date | string | null | undefined;
    options?: Intl.DateTimeFormatOptions;
    fallback?: string;
};

export function FormattedDate({ date, options, fallback = 'Never' }: FormattedDateProps) {
    const [formatted, setFormatted] = useState<string | null>(null);

    useEffect(() => {
        if (!date) {
            setFormatted(fallback);
            return;
        }

        const d = new Date(date);
        // Use user's browser locale and timezone
        setFormatted(d.toLocaleDateString(undefined, options || {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }));
    }, [date, options, fallback]);

    // Render a placeholder or nothing during SSR to avoid hydration mismatch, 
    // or a server-consistent format if we preferred. 
    // For 'Last accessed', usually safer to show nothing or a skeleton until client loads 
    // if exactness is required, effectively deferring to client.
    if (formatted === null) {
        return <span className="opacity-0">Loading...</span>; // or just return null
    }

    return <>{formatted}</>;
}
