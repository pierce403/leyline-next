import { prisma } from "@/lib/prisma";
import { getAuth0Session } from "@/lib/auth0";

export type CompanySummary = {
    id: string;
    name: string;
    location: string | null;
    type: string | null;
};

export async function getCompanies(): Promise<CompanySummary[]> {
    try {
        const session = await getAuth0Session();
        let auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

        // Inject mock user for local development testing
        if (!auth0UserId && process.env.NODE_ENV === 'development') {
            console.log("Using Mock User for Development");
            auth0UserId = 'google-oauth2|112992108443057787246';
        }

        if (!auth0UserId) return [];

        const user = await prisma.user.findUnique({
            where: { auth0UserId },
            select: { id: true },
        });

        if (!user) return [];

        const companies = await prisma.company.findMany({
            where: {
                userId: user.id
            },
            orderBy: {
                name: 'asc'
            },
            select: {
                id: true,
                name: true,
                location: true,
                type: true
            }
        });
        return companies;
    } catch (error) {
        console.error("Error fetching companies:", error);
        return [];
    }
}

export type CompanyDetail = CompanySummary & {
    documents: { id: string; title: string; url: string; createdAt: Date }[];
    companyNotes: { id: string; content: string; createdAt: Date }[];
    notes: string | null;  // Added notes field
    investments: {
        id: string;
        investmentType: string;
        owned: number;
        value: number;
    }[];
};

export async function getCompanyDetails(companyId: string): Promise<CompanyDetail | null> {
    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: {
                id: true,
                name: true,
                location: true,
                type: true,
                notes: true, // Fetch notes
                documents: {
                    select: { id: true, title: true, url: true, createdAt: true },
                    orderBy: { createdAt: 'desc' }
                },
                companyNotes: {
                    select: { id: true, content: true, createdAt: true },
                    orderBy: { createdAt: 'desc' }
                },
                investments: {
                    select: { id: true, investmentType: true, owned: true, value: true }
                }
            }
        });
        return company;

    } catch (error) {
        console.error("Error fetching company details:", error);
        return null;
    }
}
