import { getAuth0Client } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ auth0: string }> },
) => {
    const { auth0 } = await params;
    const client = getAuth0Client();

    try {
        switch (auth0) {
            case "login":
                // @ts-ignore
                return await client.authClient.handleLogin(req);
            case "logout":
                // @ts-ignore
                return await client.authClient.handleLogout(req);
            case "callback":
                // @ts-ignore
                return await client.authClient.handleCallback(req);
            case "me":
                // @ts-ignore
                return await client.authClient.handleProfile(req);
            default:
                return new NextResponse("Not Found", { status: 404 });
        }
    } catch (error: any) {
        console.error(error);
        return new NextResponse(error.message || "Internal Server Error", {
            status: error.status || 500,
        });
    }
};

