import { NextResponse } from "next/server";

export async function GET() {
  const hasGoogle = Boolean(
    (process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID) &&
    (process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET)
  );

  const hasGithub = Boolean(
    (process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID) &&
    (process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET)
  );

  return NextResponse.json(
    {
      google: hasGoogle,
      github: hasGithub,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    }
  );
}
