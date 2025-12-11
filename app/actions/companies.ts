'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateCompanyState = {
    errors?: {
        name?: string[];
        location?: string[];
        type?: string[];
    };
    message?: string;
};

export async function createCompany(prevState: CreateCompanyState, formData: FormData): Promise<CreateCompanyState> {
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
                name: name.trim(),
                location: location?.trim() || null,
                type: type?.trim() || null,
            },
        });

        revalidatePath("/companies");
        return { message: "success" };
    } catch (error) {
        console.error("Failed to create company:", error);
        return {
            message: "Database Error: Failed to create company.",
        };
    }
}
