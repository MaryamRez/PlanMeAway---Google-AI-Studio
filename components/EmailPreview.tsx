import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  htmlContent: string | null;
}

export const EmailPreview: React.FC<Props> = ({ htmlContent }) => {
  const navigate = useNavigate();

  if (!htmlContent) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No email content generated yet.</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand-600 hover:underline">Go Home</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
      <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Email Preview</h2>
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          Subject: Your Top 5 Travel Recommendations
        </div>
      </div>
      <div className="p-8 bg-gray-50 overflow-auto" style={{ minHeight: '600px' }}>
        <div 
          className="prose max-w-none bg-white p-8 shadow-sm mx-auto rounded-lg"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>
    </div>
  );
};
