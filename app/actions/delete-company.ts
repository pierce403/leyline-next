'use server';

export type DeleteCompanyState = {
    message?: string;
    error?: string;
};

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";
import { redirect } from "next/navigation";

export async function deleteCompany(companyId: string): Promise<DeleteCompanyState> {
    const session = await getAuth0Session();
    const auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

    if (!auth0UserId) {
        return { error: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
        where: { auth0UserId },
        select: { id: true },
    });

    if (!user) {
        return { error: "User not found" };
    }

    try {
        // Verify ownership before deleting
        const company = await prisma.company.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            return { error: "Company not found" };
        }

        if (company.userId !== user.id) {
            return { error: "You do not have permission to delete this company." };
        }

        await prisma.company.delete({
            where: { id: companyId },
        });
    } catch (error) {
        console.error("Failed to delete company:", error);
        return { error: "Failed to delete company" };
    }

    revalidatePath("/companies");
    redirect("/companies");
}
