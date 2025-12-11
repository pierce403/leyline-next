'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";
import { redirect } from "next/navigation";

export async function deleteInvestment(investmentId: string) {
    const session = await getAuth0Session();
    let auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

    if (!auth0UserId && process.env.NODE_ENV === 'development') {
        auth0UserId = 'google-oauth2|112992108443057787246';
    }

    if (!auth0UserId) return { message: "Unauthorized" };

    const user = await prisma.user.findUnique({
        where: { auth0UserId },
        select: { id: true },
    });

    if (!user) return { message: "User not found" };

    const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
    });

    if (!investment || investment.userId !== user.id) {
        return { message: "Investment not found or unauthorized" };
    }

    try {
        await prisma.investment.delete({
            where: { id: investmentId },
        });
    } catch (error) {
        console.error("Failed to delete investment:", error);
        return { message: "Failed to delete" };
    }

    revalidatePath("/portfolio");
    redirect("/portfolio");
}
