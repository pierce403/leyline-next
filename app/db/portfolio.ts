import { prisma } from "@/lib/prisma";

export type PortfolioInvestment = {
    id: string;
    companyName: string;
    type: string;
    owned: number;
    value: number;
    mock: boolean;
};

export async function getUserPortfolio(userId: string): Promise<PortfolioInvestment[]> {
    const investments = await prisma.investment.findMany({
        where: { userId },
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
}
