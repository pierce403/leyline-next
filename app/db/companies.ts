import { prisma } from "@/lib/prisma";

export type CompanySummary = {
    id: string;
    name: string;
    location: string | null;
    type: string | null;
};

export async function getCompanies(): Promise<CompanySummary[]> {
    try {
        const companies = await prisma.company.findMany({
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
