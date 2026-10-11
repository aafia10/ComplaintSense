import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Workspace } from '../api/client';

interface AppLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeWorkspace: Workspace | null;
  workspaces: Workspace[];
  onSelectWorkspace: (ws: Workspace) => void;
  onOpenDemoModal: () => void;
  onOpenNewComplaint: () => void;
  onResetDemo: () => Promise<void>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentTab,
  setCurrentTab,
  activeWorkspace,
  workspaces,
  onSelectWorkspace,
  onOpenDemoModal,
  onOpenNewComplaint,
  onResetDemo,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#07111F] font-sans overflow-hidden text-slate-800 dark:text-slate-100 transition-colors">
      {/* Sidebar (Desktop Persistent + Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeWorkspace={activeWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={onSelectWorkspace}
        onOpenDemoModal={onOpenDemoModal}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar
          currentTab={currentTab}
          activeWorkspace={activeWorkspace}
          onOpenNewComplaint={onOpenNewComplaint}
          onResetDemo={onResetDemo}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#07111F]">
          {children}
        </main>
      </div>
    </div>
  );
};
