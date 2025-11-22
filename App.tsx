import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserPreferences, CalendarEvent, TripSuggestion, TripFeedback } from './types';
import { Plane, Mail, Settings } from 'lucide-react';

// Components
import { PreferencesForm } from "./components/PreferencesForm";
import { CalendarIntegration } from './components/CalendarIntegration';
import { Dashboard } from './components/Dashboard';
import { EmailPreview } from './components/EmailPreview';

const AppContent: React.FC = () => {
  // Global State
  const [preferences, setPreferences] = useState<UserPreferences | null>(() => {
    try {
      const saved = localStorage.getItem('wanderlust_prefs');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse preferences", e);
      return null;
    }
  });
  
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [trips, setTrips] = useState<TripSuggestion[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<TripFeedback[]>(() => {
    try {
      const saved = localStorage.getItem('wanderlust_feedback');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to parse feedback", e);
      return [];
    }
  });
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (preferences) {
      localStorage.setItem('wanderlust_prefs', JSON.stringify(preferences));
    }
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('wanderlust_feedback', JSON.stringify(feedbackHistory));
  }, [feedbackHistory]);

  const handlePreferencesSave = (prefs: UserPreferences) => {
    setPreferences(prefs);
    navigate('/calendar');
  };

  const handleCalendarConnect = (events: CalendarEvent[]) => {
    setCalendarEvents(events);
    setIsConnected(true);
  };

  const handleTripsGenerated = (newTrips: TripSuggestion[], emailHtml: string) => {
    setTrips(newTrips);
    setGeneratedEmail(emailHtml);
    navigate('/dashboard');
  };

  const handleFeedback = (feedback: TripFeedback) => {
    setFeedbackHistory(prev => [...prev, feedback]);
    // Remove the trip from the current view or mark it
    setTrips(prev => prev.filter(t => t.id !== feedback.tripId));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <Plane className="h-8 w-8 text-brand-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">Wanderlust AI</span>
          </div>
          <nav className="flex space-x-4">
            {preferences && (
              <button onClick={() => navigate('/preferences')} className="p-2 text-gray-500 hover:text-brand-600" title="Preferences">
                <Settings size={20} />
              </button>
            )}
            {generatedEmail && (
              <button onClick={() => navigate('/email-preview')} className="p-2 text-gray-500 hover:text-brand-600" title="Email Preview">
                <Mail size={20} />
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={
            preferences ? <Navigate to="/dashboard" /> : <PreferencesForm onSave={handlePreferencesSave} />
          } />
          <Route path="/preferences" element={<PreferencesForm initialData={preferences} onSave={handlePreferencesSave} />} />
          <Route path="/calendar" element={
            <CalendarIntegration 
              isConnected={isConnected} 
              onConnect={handleCalendarConnect} 
              preferences={preferences}
              feedbackHistory={feedbackHistory}
              onTripsGenerated={handleTripsGenerated}
            />
          } />
          <Route path="/dashboard" element={
            <Dashboard 
              trips={trips} 
              feedbackHistory={feedbackHistory}
              onAction={handleFeedback}
            />
          } />
          <Route path="/email-preview" element={
            <EmailPreview htmlContent={generatedEmail} />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export const AppX = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}