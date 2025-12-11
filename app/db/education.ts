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
            // Fetch Course Progress
            courseProgress: {
                where: {
                    percentCompleted: {
                        lt: 100
                    }
                },
                include: {
                    course: true,
                },
                take: 5,
                orderBy: {
                    latestActionTimestamp: 'desc'
                }
            },
        },
    });

    if (!user) {
        return [];
    }

    // Map course progress to the dashboard format
    // Note: The UI label says "Program", but effectively we are showing Courses here 
    // because that's what the user interacts with primarily in the current implementation.
    return user.courseProgress.map((p) => ({
        id: p.courseId,
        name: p.course.name,
        percentCompleted: p.percentCompleted,
        lastAccessed: p.latestActionTimestamp,
    }));
}
