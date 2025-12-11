'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";

export type AddDocumentState = {
    errors?: {
        title?: string[];
        url?: string[];
    };
    message?: string;
};

export async function addDocument(companyId: string, prevState: AddDocumentState, formData: FormData): Promise<AddDocumentState> {
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

    const title = formData.get("title") as string;
    const url = formData.get("url") as string;

    if (!title || title.trim().length === 0) {
        return {
            errors: {
                title: ["Document title is required"],
            },
            message: "Missing Fields",
        };
    }

    if (!url || url.trim().length === 0) {
        return {
            errors: {
                url: ["URL is required"],
            },
            message: "Missing Fields",
        };
    }

    // Verify company ownership
    const company = await prisma.company.findUnique({
        where: { id: companyId },
    });

    if (!company) {
        return { message: "Company not found" };
    }

    if (company.userId && company.userId !== user.id) {
        return { message: "You do not have permission to edit this company" };
    }

    try {
        await prisma.companyDocument.create({
            data: {
                companyId: companyId,
                title: title.trim(),
                url: url.trim(),
            },
        });

        revalidatePath(`/companies/${companyId}`);
        return { message: "success" };
    } catch (error: any) {
        console.error("Failed to add document:", error);
        return {
            message: `Database Error: Failed to add document. ${error.message}`,
        };
    }
}
