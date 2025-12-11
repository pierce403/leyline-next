'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";

export type AddNoteState = {
    errors?: {
        content?: string[];
    };
    message?: string;
};

export async function addNote(companyId: string, prevState: AddNoteState, formData: FormData): Promise<AddNoteState> {
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

    const user = await prisma.user.findUnique({
        where: { auth0UserId },
        select: { id: true },
    });

    if (!user) {
        return { message: "User not found" };
    }

    const content = formData.get("content") as string;

    if (!content || content.trim().length === 0) {
        return {
            errors: {
                content: ["Note content is required"],
            },
            message: "Missing Fields",
        };
    }

    // Verify company ownership or access
    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });

    if (!company) {
        return { message: "Company not found" };
    }

    // In a real app we might check if user `company.userId === user.id` but the schema allows `userId` to be null? 
    // The schema says `userId String?`. But `getCompanies` uses `userId`.
    // Let's enforce ownership if userId presents, otherwise assume it's okay? 
    // Wait, the `getCompanies` function filters by `userId`. So presumably users can only see their own companies.
    // Let's verify ownership.

    if (company.userId && company.userId !== user.id) {
        return { message: "You do not have permission to edit this company" };
    }

    try {
        await prisma.companyNote.create({
            data: {
                companyId: companyId,
                content: content.trim(),
            },
        });

        revalidatePath(`/companies/${companyId}`);
        return { message: "success" };
    } catch (error: any) {
        console.error("Failed to add note:", error);
        return {
            message: `Database Error: Failed to add note. ${error.message}`,
        };
    }
}
