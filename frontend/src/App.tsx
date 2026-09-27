import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { DemoModal } from './components/DemoModal';
import { NewComplaintModal } from './components/NewComplaintModal';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { NLPAnalysisPage } from './pages/NLPAnalysisPage';
import { ModelEvaluationPage } from './pages/ModelEvaluationPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { SettingsPage } from './pages/SettingsPage';
import { fetchApi, Workspace, TicketDetail } from './api/client';

export const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState<boolean>(false);
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const wsList = await fetchApi<Workspace[]>('/workspaces');
      setWorkspaces(wsList);
      if (wsList.length > 0) {
        // Default to ShopEase if found, else first workspace
        const shopEase = wsList.find((w) => w.id === 'shopease') || wsList[0];
        setActiveWorkspace(shopEase);
      }
    } catch (err) {
      console.error('Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setIsDemoModalOpen(false);
    setSelectedTicketId(null);
    setCurrentTab('dashboard');
  };

  const handleOpenTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setCurrentTab('detail');
  };

  const handleComplaintCreated = (newTicket: TicketDetail) => {
    setSelectedTicketId(newTicket.id);
    setCurrentTab('detail');
  };

  const handleNavigateToComplaints = (filterCategory?: string) => {
    setComplaintCategoryFilter(filterCategory);
    setSelectedTicketId(null);
    setCurrentTab('complaints');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* Navigation Bar */}
      {currentTab !== 'landing' && (
        <Navbar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            setSelectedTicketId(null);
            setCurrentTab(tab);
          }}
          activeWorkspace={activeWorkspace}
          workspaces={workspaces}
          onSelectWorkspace={handleSelectWorkspace}
          onOpenDemoModal={() => setIsDemoModalOpen(true)}
          onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onExploreDemo={() => setIsDemoModalOpen(true)}
            onSelectWorkspace={handleSelectWorkspace}
            workspaces={workspaces}
            onCreateWorkspace={() => setIsDemoModalOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && activeWorkspace && (
          <DashboardPage
            activeWorkspace={activeWorkspace}
            onNavigateToComplaints={handleNavigateToComplaints}
            onSelectTicket={handleOpenTicket}
          />
        )}

        {currentTab === 'complaints' && activeWorkspace && (
          <ComplaintsPage
            activeWorkspace={activeWorkspace}
            onSelectTicket={handleOpenTicket}
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
            initialCategoryFilter={complaintCategoryFilter}
          />
        )}

        {currentTab === 'detail' && selectedTicketId && activeWorkspace && (
          <ComplaintDetailPage
            ticketId={selectedTicketId}
            activeWorkspace={activeWorkspace}
            onBack={() => setCurrentTab('complaints')}
            onSelectTicket={handleOpenTicket}
          />
        )}

        {currentTab === 'intelligence' && activeWorkspace && (
          <IntelligencePage activeWorkspace={activeWorkspace} />
        )}

        {currentTab === 'nlp' && activeWorkspace && (
          <NLPAnalysisPage activeWorkspace={activeWorkspace} />
        )}

        {currentTab === 'evaluation' && (
          <ModelEvaluationPage />
        )}

        {currentTab === 'knowledge' && activeWorkspace && (
          <KnowledgeBasePage activeWorkspace={activeWorkspace} />
        )}

        {currentTab === 'settings' && activeWorkspace && (
          <SettingsPage
            activeWorkspace={activeWorkspace}
            onWorkspaceUpdated={(updated) => {
              setActiveWorkspace(updated);
              loadWorkspaces();
            }}
          />
        )}
      </main>

      {/* Demo Selection Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        workspaces={workspaces}
        onSelectWorkspace={handleSelectWorkspace}
      />

      {/* New Complaint Live Submission Modal */}
      {activeWorkspace && (
        <NewComplaintModal
          isOpen={isNewComplaintOpen}
          onClose={() => setIsNewComplaintOpen(false)}
          activeWorkspace={activeWorkspace}
          onComplaintCreated={handleComplaintCreated}
        />
      )}

    </div>
  );
};

export default App;
