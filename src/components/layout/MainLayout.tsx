import React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ChatBoard } from '../chat/ChatBoard';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
      <ChatBoard />
    </div>
  );
}
