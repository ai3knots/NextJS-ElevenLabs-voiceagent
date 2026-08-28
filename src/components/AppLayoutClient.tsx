'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import ConvaiWidget from '@/components/ConvaiWidget';
import ChatWidget from '@/components/ChatWidget';

export default function AppLayoutClient({
  children,
  allAgents = [],
  currentAgentId = '',
  currentAgentName = '',
}: {
  children: React.ReactNode;
  allAgents?: any[];
  currentAgentId?: string;
  currentAgentName?: string;
}) {
  const pathname = usePathname();
  const isFullScreenPage = pathname === '/login' || pathname === '/demo';

  if (isFullScreenPage) {
    return <>{children}</>;
  }

  // Determine active widget behavior
  const isChatDetailsPage = pathname?.startsWith('/chats/') && pathname !== '/chats';
  const isChatPage = pathname === '/chats' || pathname === '/chat-agent';

  return (
    <>
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="ml-[260px] flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
        <Topbar
          agents={allAgents}
          currentAgentId={currentAgentId}
          currentAgentName={currentAgentName}
        />

        <main className="p-8 max-w-[1300px] w-full mx-auto">{children}</main>
      </div>

      {/* No floating widget on chat details page; ChatWidget on /chats & /chat-agent; ConvaiWidget elsewhere */}
      {isChatDetailsPage ? null : isChatPage ? (
        <ChatWidget />
      ) : (
        <ConvaiWidget agentId={currentAgentId} />
      )}
    </>
  );
}
