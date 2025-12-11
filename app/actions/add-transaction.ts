'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuth0Session } from "@/lib/auth0";

export type AddTransactionState = {
    errors?: {
        transactionType?: string[];
        amount?: string[];
        quantity?: string[];
        occurredAt?: string[];
    };
    message?: string;
};

export async function addTransaction(investmentId: string, prevState: AddTransactionState, formData: FormData): Promise<AddTransactionState> {
    const session = await getAuth0Session();
    let auth0UserId = session?.user?.sub ? (session.user.sub as string) : null;

    if (!auth0UserId && process.env.NODE_ENV === 'development') {
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

    const investment = await prisma.investment.findUnique({
        where: { id: investmentId },
    });

    if (!investment || investment.userId !== user.id) {
        return { message: "Investment not found or unauthorized" };
    }

    const transactionType = formData.get("transactionType") as string;
    const amountStr = formData.get("amount") as string;
    const quantityStr = formData.get("quantity") as string;
    const occurredAtStr = formData.get("occurredAt") as string;

    const amount = parseFloat(amountStr);
    const quantity = quantityStr ? parseFloat(quantityStr) : null;

    if (!transactionType) return { errors: { transactionType: ["Required"] }, message: "Missing Fields" };
    if (isNaN(amount)) return { errors: { amount: ["Invalid amount"] }, message: "Invalid Amount" };
    if (!occurredAtStr) return { errors: { occurredAt: ["Required"] }, message: "Missing Fields" };

    try {
        await prisma.$transaction(async (tx) => {
            // Create Transaction
            await tx.investmentTransaction.create({
                data: {
                    investmentId,
                    transactionType,
                    amount,
                    quantity,
                    occurredAt: new Date(occurredAtStr),
                }
            });

            // Update Investment Holdings
            // Logic: 
            // - Buy/Exercise: Add to owned, add to value (cost basis logic? for now just update owned)
            // - Sell: Subtract from owned
            // This is a naive implementation, but serves the immediate need.
            if (quantity) {
                if (['Buy', 'Exercise', 'Dividend Reinvestment'].includes(transactionType)) {
                    await tx.investment.update({
                        where: { id: investmentId },
                        data: {
                            owned: { increment: quantity },
                            value: { increment: amount } // Assuming amount is cost, adding to book value
                        }
                    });
                } else if (['Sell'].includes(transactionType)) {
                    await tx.investment.update({
                        where: { id: investmentId },
                        data: {
                            owned: { decrement: quantity },
                            // Value logic on sell is tricky (cost basis reduction vs realized gain). 
                            // For simple "Portfolio Value" tracking, maybe we shouldn't decrement value by sale price?
                            // But usually "Value" = "Current Market Value of Holdings". 
                            // If we sold, we hold less, so value should go down.
                            // Let's decrement value by a proportional amount or just leave it for manual update?
                            // Let's assume manual update for value usually, or simple subtraction of cost.
                            // To keep it simple and showing movement:
                            value: { decrement: amount }
                        }
                    });
                }
            }
        });

        revalidatePath(`/portfolio/${investmentId}`);
        revalidatePath(`/portfolio`);
        return { message: "success" };
    } catch (error: any) {
        console.error("Failed to add transaction:", error);
        return { message: "Database Error" };
    }
}
