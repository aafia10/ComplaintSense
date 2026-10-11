import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { fetchApi, TicketDetail, Workspace } from '../api/client';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkspace: Workspace;
  onComplaintCreated: (ticket: TicketDetail) => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  activeWorkspace,
  onComplaintCreated,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) {
      setError('Please provide both a subject and complaint text.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetchApi<TicketDetail>('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          workspace_id: activeWorkspace.id,
          customer_name: customerName.trim() || 'Aisha Sharma',
          customer_email: customerEmail.trim() || 'aisha.sharma@example.com',
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      onComplaintCreated(res);
      onClose();
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const sampleComplaints = [
    {
      label: 'Mumbai Delivery Delay',
      subject: 'SpeedFast courier delayed again in Mumbai',
      message: 'My order #ORD-99182 was supposed to arrive yesterday in Mumbai. The courier tracking has been stuck at the Mumbai sorting hub for 3 days with SpeedFast Logistics. Deliver today ASAP!',
    },
    {
      label: 'Double Debit UPI',
      subject: 'Charged twice on UPI checkout',
      message: 'Payment failed first time at checkout, retried and ₹3,500 was deducted twice from my bank account for order #ORD-44192. Reverse one charge immediately.',
    },
    {
      label: 'Defective Hardware',
      subject: 'Screen broken upon unboxing',
      message: 'Received my new smartphone today. The box was dented and the front screen is completely shattered. Need an immediate replacement unit.',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0D1B2A] rounded-2xl shadow-modal max-w-xl w-full p-6 sm:p-7 border border-slate-200 dark:border-[#23364D] relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Interactive NLP Ingestion</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Submit Complaint to {activeWorkspace.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Type any customer grievance. The backend NLP engine will perform real-time preprocessing, classification, intent detection, sentiment scoring, urgency analysis, entity extraction, and local response drafting.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Quick Fill Examples
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleComplaints.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(sample.subject);
                  setMessage(sample.message);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#13263A] hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-700 dark:hover:text-blue-300 border border-slate-200 dark:border-[#23364D] text-slate-700 dark:text-slate-300 transition cursor-pointer font-medium"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Verma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                placeholder="e.g. rahul@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Complaint Subject *
            </label>
            <input
              type="text"
              required
              placeholder="Brief summary of the grievance..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Full Complaint Grievance Text *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Paste raw customer message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-[#23364D] bg-slate-50 dark:bg-[#13263A] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed font-sans"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#23364D] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#13263A] rounded-xl transition cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2A5F] hover:bg-[#163A7A] dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold shadow-subtle transition cursor-pointer min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing NLP Pipeline...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Run Live Ingestion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
