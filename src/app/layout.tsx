import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppLayoutClient from "@/components/AppLayoutClient";
import { Toaster } from "react-hot-toast";
import { getCurrentAgentId, fetchAgentDetails, fetchAllAgents } from "@/actions/agent.actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ElevenLabs Voice Agent CRM",
  description: "Manage leads and outbound AI voice calls",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentAgentId = await getCurrentAgentId() || "";
  const agentDetails = await fetchAgentDetails();
  const currentAgentName = agentDetails?.name || "Emma-American";
  const allAgentsRaw = await fetchAllAgents();
  const allAgents = allAgentsRaw?.agents || [];

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.className} bg-gray-50 flex min-h-screen text-slate-900`}>
        <AppLayoutClient
          allAgents={allAgents}
          currentAgentId={currentAgentId}
          currentAgentName={currentAgentName}
        >
          {children}
        </AppLayoutClient>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
