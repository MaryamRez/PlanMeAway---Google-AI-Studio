import React, { useState } from 'react';
import { TripSuggestion, TripFeedback } from '../types';
import { Check, X, ChevronDown, ChevronUp, MapPin, DollarSign, Plane, Building } from 'lucide-react';
import { FeedbackModal } from "./FeedbackModal";
import { useNavigate } from 'react-router-dom';

interface Props {
  trips: TripSuggestion[];
  feedbackHistory: TripFeedback[];
  onAction: (feedback: TripFeedback) => void;
}

export const Dashboard: React.FC<Props> = ({ trips, onAction }) => {
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<TripSuggestion | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'decline'>('accept');
  const navigate = useNavigate();

  const toggleExpand = (id: string) => {
    setExpandedTrip(expandedTrip === id ? null : id);
  };

  const handleActionClick = (trip: TripSuggestion, type: 'accept' | 'decline') => {
    setSelectedTrip(trip);
    setActionType(type);
    setModalOpen(true);
  };

  const handleModalSubmit = (feedbackText: string, reason?: string) => {
    if (selectedTrip) {
      const feedback: TripFeedback = {
        tripId: selectedTrip.id,
        accepted: actionType === 'accept',
        timestamp: Date.now(),
        feedbackText,
        reason
      };
      onAction(feedback);
      setModalOpen(false);
      setSelectedTrip(null);
    }
  };

  if (trips.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-100 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Suggestions</h2>
        <p className="text-gray-500 mb-6">Go to the calendar page to generate new trip ideas.</p>
        <button 
          onClick={() => navigate('/calendar')} 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700"
        >
          Go to Calendar
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Your Recommendations</h1>
        <span className="bg-brand-100 text-brand-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-brand-200 dark:text-brand-800">
          {trips.length} Options
        </span>
      </div>

      <div className="space-y-4">
        {trips.map(trip => (
          <div key={trip.id} className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Header / Summary Card */}
            <div className="p-6 cursor-pointer" onClick={() => toggleExpand(trip.id)}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-brand-50 p-3 rounded-lg">
                    <MapPin className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{trip.destination}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                      <span className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> {trip.totalPrice} {trip.currency}</span>
                      <span className="text-gray-300">|</span>
                      <span>{trip.dates}</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-brand-600">
                  {expandedTrip === trip.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
              </div>
              <p className="mt-4 text-gray-600 text-sm line-clamp-2">{trip.summary}</p>
            </div>

            {/* Expanded Details */}
            {expandedTrip === trip.id && (
              <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  
                  {/* Flight */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-3 text-brand-700">
                      <Plane className="h-4 w-4 mr-2" />
                      <h4 className="font-semibold text-sm uppercase tracking-wider">Flight Details</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-500">Airline:</span> {trip.flight.airline}</p>
                      <p><span className="text-gray-500">Departure:</span> {trip.flight.departureTime}</p>
                      <p><span className="text-gray-500">Return:</span> {trip.flight.arrivalTime}</p>
                      <p className="font-medium"><span className="text-gray-500">Est. Price:</span> {trip.flight.price} {trip.currency}</p>
                    </div>
                  </div>

                  {/* Hotel */}
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-3 text-brand-700">
                      <Building className="h-4 w-4 mr-2" />
                      <h4 className="font-semibold text-sm uppercase tracking-wider">Accommodation</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{trip.hotel.name}</p>
                      <p><span className="text-gray-500">Rating:</span> {trip.hotel.rating} / 5</p>
                      <p><span className="text-gray-500">Address:</span> {trip.hotel.address}</p>
                      <p className="font-medium"><span className="text-gray-500">Price/Night:</span> {trip.hotel.pricePerNight} {trip.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-4">
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">Trip Highlights</h4>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((highlight, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3 justify-end border-t border-gray-200 pt-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleActionClick(trip, 'decline'); }}
                    className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2 text-red-500" /> Decline
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleActionClick(trip, 'accept'); }}
                    className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                  >
                    <Check className="h-4 w-4 mr-2" /> Accept Proposal
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && selectedTrip && (
        <FeedbackModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
          type={actionType}
          destination={selectedTrip.destination}
        />
      )}
    </div>
  );
};