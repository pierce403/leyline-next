import { prisma } from "@/lib/prisma";
import { getAuth0Session } from "@/lib/auth0";

export type PortfolioInvestment = {
    id: string;
    companyName: string;
    type: string;
    owned: number;
    value: number;
    mock: boolean;
};

export async function getUserPortfolio(): Promise<PortfolioInvestment[]> {
    try {
        const session = await getAuth0Session();
        let auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

        // Inject mock user for local development testing
        if (!auth0UserId && process.env.NODE_ENV === 'development') {
            // console.log("Using Mock User for Development in getUserPortfolio");
            auth0UserId = 'google-oauth2|112992108443057787246';
        }

        if (!auth0UserId) return [];

        const user = await prisma.user.findUnique({
            where: { auth0UserId },
            select: { id: true },
        });

        if (!user) return [];

        const investments = await prisma.investment.findMany({
            where: { userId: user.id },
            include: {
                company: {
                    select: { name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return investments.map(inv => ({
            id: inv.id,
            companyName: inv.company.name,
            type: inv.investmentType,
            owned: inv.owned,
            value: inv.value,
            mock: inv.mock
        }));
    } catch (error) {
        console.error("Error fetching user portfolio:", error);
        return [];
    }
}

export type InvestmentDetail = PortfolioInvestment & {
    companyId: string;
    transactions: {
        id: string;
        transactionType: string;
        amount: number;
        quantity: number | null;
        occurredAt: Date;
    }[];
};

export async function getInvestmentDetails(investmentId: string): Promise<InvestmentDetail | null> {
    try {
        const session = await getAuth0Session();
        let auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

        if (!auth0UserId && process.env.NODE_ENV === 'development') {
            auth0UserId = 'google-oauth2|112992108443057787246';
        }

        if (!auth0UserId) return null;

        const user = await prisma.user.findUnique({
            where: { auth0UserId },
            select: { id: true },
        });

        if (!user) return null;

        const investment = await prisma.investment.findUnique({
            where: { id: investmentId },
            include: {
                company: {
                    select: { name: true }
                },
                transactions: {
                    orderBy: { occurredAt: 'desc' }
                }
            }
        });

        if (!investment || investment.userId !== user.id) return null;

        return {
            id: investment.id,
            companyName: investment.company.name,
            companyId: investment.companyId,
            type: investment.investmentType,
            owned: investment.owned,
            value: investment.value,
            mock: investment.mock,
            transactions: investment.transactions
        };
    } catch (error) {
        console.error("Error fetching investment details:", error);
        return null;
    }
}
