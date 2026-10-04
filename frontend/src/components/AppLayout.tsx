import React from 'react';
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
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-800">
      {/* Fixed Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeWorkspace={activeWorkspace}
        workspaces={workspaces}
        onSelectWorkspace={onSelectWorkspace}
        onOpenDemoModal={onOpenDemoModal}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <TopBar
          currentTab={currentTab}
          activeWorkspace={activeWorkspace}
          onOpenNewComplaint={onOpenNewComplaint}
          onResetDemo={onResetDemo}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
