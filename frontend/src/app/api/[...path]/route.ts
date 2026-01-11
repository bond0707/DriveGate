import { NextRequest, NextResponse } from "next/server";

// Server-side environment variables (not exposed to browser)
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.API_KEY;

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    // 1. Reconstruct the backend URL (e.g., /api/auth/me -> https://fastapi.../auth/me)
    const { path } = await params;
    const pathString = path.join("/");
    
    // Preserve query string
    const url = new URL(req.url);
    const queryString = url.search;
    const backendUrl = `${API_URL}/${pathString}${queryString}`;

    // 2. Prepare headers - clone and add API key
    const headers = new Headers(req.headers);
    headers.set("X-API-Key", API_KEY!);
    
    // Remove headers that shouldn't be forwarded
    headers.delete("host");
    headers.delete("connection");

    try {
        // 3. Forward the request to FastAPI
        const response = await fetch(backendUrl, {
            method: req.method,
            headers: headers,
            body: req.body,
            // @ts-expect-error - duplex is required for streaming request bodies
            duplex: "half",
        });

        // 4. Build response headers (filter out problematic ones)
        const responseHeaders = new Headers();
        response.headers.forEach((value, key) => {
            // Skip headers that Next.js handles
            if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
                responseHeaders.set(key, value);
            }
        });

        // 5. Return FastAPI's response back to the browser
        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Backend unreachable" },
            { status: 502 }
        );
    }
}

// Export handler for all HTTP methods
export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
