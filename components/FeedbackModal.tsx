import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, reason?: string) => void;
  type: 'accept' | 'decline';
  destination: string;
}

export const FeedbackModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, type, destination }) => {
  const [reason, setReason] = useState('Price');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (type === 'decline' && !feedback.trim()) {
      setError('Please provide some feedback so we can improve next time.');
      return;
    }

    onSubmit(feedback, type === 'decline' ? reason : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900">
            {type === 'accept' ? 'Great Choice!' : 'Not Interested?'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-4">
            {type === 'accept' 
              ? `You are accepting the trip to ${destination}. Any specific requests or notes?`
              : `Help us understand why ${destination} isn't right for you.`
            }
          </p>

          {type === 'decline' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <select 
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-500 focus:border-brand-500 sm:text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="Price">Too Expensive</option>
                <option value="Dates">Dates don't work</option>
                <option value="Destination">Don't like the destination</option>
                <option value="Activity">Activities not interesting</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'decline' ? 'Feedback (Required)' : 'Feedback (Optional)'}
            </label>
            <textarea
              rows={4}
              className="shadow-sm focus:ring-brand-500 focus:border-brand-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
              placeholder={type === 'decline' ? "E.g., I prefer warmer climates..." : "E.g., I'd like a room with a view..."}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none ${
                type === 'accept' 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }`}
            >
              {type === 'accept' ? 'Confirm Trip' : 'Decline Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
