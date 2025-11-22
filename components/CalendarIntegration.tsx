import React, { useState } from 'react';
import { Calendar, Lock, RefreshCw, Check, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { CalendarEvent, UserPreferences, TripSuggestion, TripFeedback } from '../types';
import { generateTripSuggestions, generateEmailContent } from '../services/geminiService';

interface Props {
  isConnected: boolean;
  onConnect: (events: CalendarEvent[]) => void;
  preferences: UserPreferences | null;
  feedbackHistory: TripFeedback[];
  onTripsGenerated: (trips: TripSuggestion[], emailHtml: string) => void;
}

export const CalendarIntegration: React.FC<Props> = ({ isConnected, onConnect, preferences, feedbackHistory, onTripsGenerated }) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'error' | 'connected' | 'scanning' | 'processing'>('idle');
  const [detectedEvents, setDetectedEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const handleConnect = async () => {
    setStatus('connecting');
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate random failure for "User-friendly error" requirement
    const shouldFail = Math.random() < 0.3; 
    
    if (shouldFail) {
      setStatus('error');
    } else {
      setStatus('connected');
      // Mock events
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Weekly Team Sync',
          start: '2026-11-10',
          end: '2026-11-10'
        },
        {
          id: '2',
          title: 'Travel to Europe',
          start: '2026-02-01',
          end: '2026-02-08'
        },
        {
          id: '3',
          title: 'Dentist Appointment',
          start: '2026-11-15',
          end: '2026-11-15'
        }
      ];
      onConnect(mockEvents);
      setDetectedEvents(mockEvents);
      
      // Auto scan for "Travel" blocks
      setStatus('scanning');
      setTimeout(() => {
        setStatus('idle'); // Ready for selection
      }, 1000);
    }
  };

  const handleGenerate = async () => {
    setGenerationError(null);
    
    if (!selectedEventId) {
      setGenerationError("Please select a travel event first.");
      return;
    }

    if (!preferences) {
      setGenerationError("User preferences are missing. Please return to settings.");
      return;
    }
    
    const event = detectedEvents.find(e => e.id === selectedEventId);
    if (!event) {
      setGenerationError("Selected event not found.");
      return;
    }

    setStatus('processing');

    try {
      // 1. Generate Recommendations
      const suggestions = await generateTripSuggestions(preferences, event, feedbackHistory);
      
      if (!suggestions || suggestions.length === 0) {
        throw new Error("No suitable trips found. Please try adjusting your preferences.");
      }

      // 2. Generate Email
      const emailHtml = await generateEmailContent(suggestions, "Traveler");

      onTripsGenerated(suggestions, emailHtml);
    } catch (err: any) {
      console.error("Generation failed:", err);
      setStatus('idle');
      setGenerationError(err.message || "Failed to generate recommendations. Please check your API configuration.");
    }
  };

  const travelEvents = detectedEvents.filter(e => e.title.toLowerCase().startsWith('travel'));

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">AI is crafting your perfect itinerary...</h2>
        <p className="text-gray-500">Searching flights, hotels, and experiences.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-blue-100 rounded-full">
          <Calendar className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sync Your Schedule</h2>
          <p className="text-gray-600">We'll find travel windows in your calendar.</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
           {status === 'error' ? (
             <div className="mb-6">
               <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
               <h3 className="text-lg font-medium text-red-600">Connection Failed</h3>
               <p className="text-gray-500 max-w-sm mx-auto">We couldn't access your Google Calendar. Please check your permissions and try again.</p>
               <button 
                 onClick={handleConnect}
                 className="mt-4 px-6 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
               >
                 Retry Connection
               </button>
             </div>
           ) : (
             <div className="mb-6">
               <Lock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
               <p className="text-gray-500 mb-6">We need read-access to identify "Travel" blocks.</p>
               <button
                onClick={handleConnect}
                disabled={status === 'connecting'}
                className="px-6 py-3 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 transition-all flex items-center mx-auto disabled:opacity-75"
               >
                 {status === 'connecting' ? (
                   <>
                     <RefreshCw className="animate-spin h-5 w-5 mr-2" /> Connecting...
                   </>
                 ) : (
                   "Connect Google Calendar"
                 )}
               </button>
               <div className="mt-4">
                <button className="text-sm text-gray-400 hover:underline">Skip for now (Manual Entry)</button>
               </div>
             </div>
           )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Calendar Connected</span>
            </div>
            <span className="text-sm text-green-700">{detectedEvents.length} events found</span>
          </div>

          <h3 className="text-lg font-medium text-gray-900">Detected Travel Blocks</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {travelEvents.length > 0 ? travelEvents.map(event => (
              <div 
                key={event.id} 
                onClick={() => setSelectedEventId(event.id)}
                className={`cursor-pointer border rounded-lg p-4 transition-all ${
                  selectedEventId === event.id 
                    ? 'border-brand-500 ring-2 ring-brand-200 bg-brand-50' 
                    : 'border-gray-200 hover:border-brand-300 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{event.start} — {event.end}</p>
                  </div>
                  {selectedEventId === event.id && <CheckCircle className="h-5 w-5 text-brand-600" />}
                </div>
              </div>
            )) : (
              <p className="text-gray-500 col-span-2 text-center py-4">No events starting with "Travel" found.</p>
            )}
          </div>

          <div className="flex flex-col items-end pt-4 border-t">
            {generationError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded-md flex items-center w-full">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{generationError}</span>
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={!selectedEventId}
              className="flex items-center px-6 py-3 bg-brand-600 text-white rounded-md font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Generate Recommendations <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};