import { useEffect } from 'react';

export const usePageTitle = (pageTitle?: string) => {
  useEffect(() => {
    const baseTitle = 'ComplaintSense';
    if (pageTitle && pageTitle.trim()) {
      document.title = `${baseTitle} — ${pageTitle.trim()}`;
    } else {
      document.title = `${baseTitle} — Customer Complaint Intelligence`;
    }
  }, [pageTitle]);
};
