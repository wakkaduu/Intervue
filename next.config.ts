import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GEMINI_API_KEY is accessed server-side only via process.env.GEMINI_API_KEY
  // It must NEVER be prefixed with NEXT_PUBLIC_
};

export default nextConfig;
