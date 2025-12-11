'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";

export type CreateCompanyState = {
    errors?: {
        name?: string[];
        location?: string[];
        type?: string[];
    };
    message?: string;
};

export async function createCompany(prevState: CreateCompanyState, formData: FormData): Promise<CreateCompanyState> {
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

    if (!name || name.trim().length === 0) {
        return {
            errors: {
                name: ["Company name is required"],
            },
            message: "Missing Fields",
        };
    }

    try {
        await prisma.company.create({
            data: {
                userId: user.id,
                name: name.trim(),
                location: location?.trim() || null,
                type: type?.trim() || null,
                tags: [],
            },
        });

        revalidatePath("/companies");
        return { message: "success" };
    } catch (error: any) {
        console.error("Failed to create company:", error);
        return {
            message: `Database Error: Failed to create company. ${error.message}`,
        };
    }
}
