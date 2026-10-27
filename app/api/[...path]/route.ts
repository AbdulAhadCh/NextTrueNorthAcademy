import { NextResponse } from "next/server";
import {
  getNestApiUrl,
  getSessionAccessToken,
} from "@/lib/nest-api";

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: Request, { params }: RouteContext) {
  const accessToken = await getSessionAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let apiUrl: URL;
  try {
    const { path } = await params;
    apiUrl = getNestApiUrl(path);
    apiUrl.search = new URL(request.url).search;
  } catch {
    console.error("NestJS API URL configuration is invalid");
    return NextResponse.json(
      { error: "NestJS API URL is not configured correctly" },
      { status: 500 },
    );
  }

  const headers = new Headers({
    Accept: request.headers.get("accept") ?? "application/json",
    Authorization: `Bearer ${accessToken}`,
  });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  let body: ArrayBuffer | undefined;
  if (request.body) body = await request.arrayBuffer();

  try {
    return await fetch(apiUrl, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    });
  } catch (error) {
    console.error("NestJS API request failed", error);
    return NextResponse.json(
      { error: "Could not reach the NestJS API" },
      { status: 502 },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PATCH = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
