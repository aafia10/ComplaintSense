import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { usePageTitle } from './hooks/usePageTitle';
import { AppLayout } from './components/AppLayout';
import { DemoModal } from './components/DemoModal';
import { NewComplaintModal } from './components/NewComplaintModal';
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { IntelligencePage } from './pages/IntelligencePage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { NLPLabPage } from './pages/NLPLabPage';
import { SettingsPage } from './pages/SettingsPage';
import { fetchApi, Workspace, TicketDetail } from './api/client';

const AppContent: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState<boolean>(false);
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  // Dynamic Browser Tab Title
  const getPageTitle = () => {
    switch (currentTab) {
      case 'landing':
        return 'Turn customer complaints into actionable intelligence';
      case 'overview':
      case 'dashboard':
        return 'Executive Overview';
      case 'complaints':
        return 'Complaints Workbench';
      case 'detail':
        return selectedTicketId ? `Complaint #${selectedTicketId}` : 'Complaint Detail';
      case 'intelligence':
        return 'Intelligence & Discovery';
      case 'knowledge':
        return 'Knowledge Base & SOPs';
      case 'nlp':
        return 'NLP Lab & Evaluation';
      case 'settings':
        return 'Settings';
      default:
        return 'Customer Complaint Intelligence';
    }
  };

  usePageTitle(getPageTitle());

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const wsList = await fetchApi<Workspace[]>('/workspaces');
      setWorkspaces(wsList);
      if (wsList.length > 0) {
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
    setCurrentTab('overview');
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

  const handleNavigateToIntelligence = () => {
    setSelectedTicketId(null);
    setCurrentTab('intelligence');
  };

  const handleResetDemoData = async () => {
    await fetchApi('/data/reset-demo', { method: 'POST' });
    await loadWorkspaces();
  };

  return (
    <>
      {currentTab === 'landing' ? (
        <LandingPage
          onExploreDemo={() => setIsDemoModalOpen(true)}
          onSelectWorkspace={handleSelectWorkspace}
          workspaces={workspaces}
          onCreateWorkspace={() => setIsDemoModalOpen(true)}
        />
      ) : (
        <AppLayout
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
          onResetDemo={handleResetDemoData}
        >
          {activeWorkspace && (
            <>
              {(currentTab === 'overview' || currentTab === 'dashboard') && (
                <OverviewPage
                  activeWorkspace={activeWorkspace}
                  onNavigateToComplaints={handleNavigateToComplaints}
                  onNavigateToIntelligence={handleNavigateToIntelligence}
                  onSelectTicket={handleOpenTicket}
                />
              )}

              {currentTab === 'complaints' && (
                <ComplaintsPage
                  activeWorkspace={activeWorkspace}
                  onSelectTicket={handleOpenTicket}
                  onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
                  initialCategoryFilter={complaintCategoryFilter}
                />
              )}

              {currentTab === 'detail' && selectedTicketId && (
                <ComplaintDetailPage
                  ticketId={selectedTicketId}
                  activeWorkspace={activeWorkspace}
                  onBack={() => setCurrentTab('complaints')}
                  onSelectTicket={handleOpenTicket}
                />
              )}

              {currentTab === 'intelligence' && (
                <IntelligencePage
                  activeWorkspace={activeWorkspace}
                  onSelectTicket={handleOpenTicket}
                />
              )}

              {currentTab === 'knowledge' && (
                <KnowledgeBasePage activeWorkspace={activeWorkspace} />
              )}

              {currentTab === 'nlp' && (
                <NLPLabPage activeWorkspace={activeWorkspace} />
              )}

              {currentTab === 'settings' && (
                <SettingsPage
                  activeWorkspace={activeWorkspace}
                  onWorkspaceUpdated={(updated) => {
                    setActiveWorkspace(updated);
                    loadWorkspaces();
                  }}
                />
              )}
            </>
          )}
        </AppLayout>
      )}

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
    </>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
