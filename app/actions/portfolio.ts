'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";

export type CreateInvestmentState = {
    errors?: {
        companyId?: string[];
        investmentType?: string[];
    };
    message?: string;
};

export async function createInvestment(prevState: CreateInvestmentState, formData: FormData): Promise<CreateInvestmentState> {
    const session = await getAuth0Session();
    let auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

    // Inject mock user for local development testing
    if (!auth0UserId && process.env.NODE_ENV === 'development') {
        console.log("Using Mock User for Development");
        auth0UserId = 'google-oauth2|112992108443057787246';
    }

    if (!auth0UserId) {
        return { message: "Unauthorized" };
    }

    // Ensure user exists in DB
    const user = await prisma.user.findUnique({ where: { auth0UserId } });
    if (!user) {
        return { message: "User not found" };
    }

    const companyId = formData.get("companyId") as string;
    const investmentType = formData.get("investmentType") as string;
    const isMock = formData.get("isMock") === "on";

    if (!companyId) {
        return {
            errors: {
                companyId: ["Company is required"],
            },
            message: "Missing Fields",
        };
    }

    if (!investmentType) {
        return {
            errors: {
                investmentType: ["Investment Type is required"]
            },
            message: "Missing Fields"
        }
    }

    try {
        await prisma.investment.create({
            data: {
                userId: user.id,
                companyId: companyId,
                investmentType: investmentType,
                mock: isMock,
                // Default values for now, transactions add to these
                owned: 0,
                value: 0
            },
        });

        revalidatePath("/portfolio");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to create investment:", error);
        return {
            message: "Database Error: Failed to create investment.",
        };
    }
}
