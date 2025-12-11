'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";

export type UpdateCompanyState = {
    errors?: {
        name?: string[];
        location?: string[];
        type?: string[];
        notes?: string[];
    };
    message?: string;
};

export async function updateCompany(
    companyId: string,
    prevState: UpdateCompanyState,
    formData: FormData
): Promise<UpdateCompanyState> {
    const session = await getAuth0Session();
    const auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

    if (!auth0UserId) {
        return { message: "Unauthorized" };
    }

    const user = await prisma.user.findUnique({
        where: { auth0UserId },
        select: { id: true },
    });

    if (!user) {
        return { message: "User not found" };
    }

    const name = formData.get("name") as string;
    const location = formData.get("location") as string;
    const type = formData.get("type") as string;
    const notes = formData.get("notes") as string;

    if (!name) {
        return {
            errors: {
                name: ["Company Name is required"],
            },
            message: "Missing Fields",
        };
    }

    try {
        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if (!company) return { message: "Company not found" };
        if (company.userId !== user.id) return { message: "Unauthorized" };

        await prisma.company.update({
            where: { id: companyId },
            data: {
                name: name.trim(),
                location: location?.trim() || null,
                type: type?.trim() || null,
                notes: notes?.trim() || null,
            },
        });

        revalidatePath(`/companies/${companyId}`);
        revalidatePath("/companies");
        return { message: "success" };
    } catch (error: any) {
        console.error("Failed to update company:", error);
        return {
            message: `Database Error: Failed to update company. ${error.message}`,
        };
    }
}
