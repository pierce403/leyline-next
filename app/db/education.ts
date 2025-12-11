import { prisma } from "@/lib/prisma";

export type DashboardEducationProgress = {
    id: string;
    name: string;
    percentCompleted: number;
    lastAccessed: Date | null;
};

export async function getUserDashboardEducationProgress(
    auth0UserId: string,
): Promise<DashboardEducationProgress[]> {
    const user = await prisma.user.findUnique({
        where: { auth0UserId },
        include: {
            programProgress: {
                where: {
                    // We only want programs that are NOT completed? 
                    // The screenshot shows "Educational Progress", usually implying things in flight.
                    // But it also shows "Completed" column. So maybe all active progress?
                    // "Table listing incomplete education programs" says the spec (TRANSITION_PLAN.md 5.2.1)
                    percentCompleted: {
                        lt: 100
                    }
                },
                include: {
                    program: true,
                },
                take: 5, // Limit to reasonable number for dashboard
                orderBy: {
                    latestActionTimestamp: 'desc'
                }
            },
        },
    });

    if (!user) {
        return [];
    }

    return user.programProgress.map((p) => ({
        id: p.programId,
        name: p.program.name,
        percentCompleted: p.percentCompleted,
        lastAccessed: p.latestActionTimestamp,
    }));
}
