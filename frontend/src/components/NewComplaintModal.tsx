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
      message: 'My order #ORD99182 was supposed to arrive yesterday in Mumbai. The courier tracking has been stuck at the Mumbai sorting hub for 3 days with SpeedFast Logistics. Deliver today ASAP!',
    },
    {
      label: 'Double Debit UPI',
      subject: 'Charged twice on UPI checkout',
      message: 'Payment failed first time at checkout, retried and ₹3,500 was deducted twice from my bank account for order #ORD44192. Reverse one charge immediately.',
    },
    {
      label: 'Defective Hardware',
      subject: 'Screen broken upon unboxing',
      message: 'Received my new Samsung Galaxy smartphone today. The box was dented and the front screen is completely shattered. Need an immediate replacement.',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 border border-gray-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive NLP Ingestion</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            Submit Complaint to {activeWorkspace.name}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Type any raw customer text. The backend NLP engine will perform real-time preprocessing, category prediction, intent detection, sentiment scoring, urgency analysis, entity extraction, and local response draft generation.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1.5">
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
                  setCustomerName('Rahul Verma');
                  setCustomerEmail('rahul.verma@example.com');
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200 text-gray-700 transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aisha Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Customer Email
              </label>
              <input
                type="email"
                placeholder="e.g. aisha@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Delayed package delivery in Mumbai"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Complaint Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Paste raw customer complaint message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running NLP Pipeline...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Ingest & Analyze
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
