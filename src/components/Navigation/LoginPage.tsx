"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  // Automatically handle redirect after Discord login
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");

    if (accessToken) {
      // Store token and redirect to homepage
      localStorage.setItem("access_token", accessToken);
      router.replace("/"); // redirect to homepage
    }
  }, [router]);

  // Discord login URL
  const discordLoginUrl =
    "https://legacyrpnepal.vercel.app/auth/discord/login";

  return (
    <div className="flex justify-center items-center h-screen bg-gta-black">
      <a
        href={discordLoginUrl}
        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200"
      >
        Login with Discord
      </a>
    </div>
  );
}
