export enum ActivityLevel {
  RELAXED = 'Relaxed',
  MODERATE = 'Moderate',
  ACTIVE = 'Active',
}

export interface UserPreferences {
  originCity: string;
  preferredAirport: string;
  budget: number;
  currency: string;
  activityLevel: ActivityLevel;
  interests: string[];
  excludedDestinations: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date
  end: string;   // ISO Date
}

export interface FlightDetails {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  airline: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
}

export interface HotelDetails {
  name: string;
  rating: number;
  address: string;
  pricePerNight: number;
}

export interface TripSuggestion {
  id: string;
  destination: string;
  dates: string;
  totalPrice: number;
  currency: string;
  flight: FlightDetails;
  hotel: HotelDetails;
  summary: string;
  highlights: string[];
}

export interface TripFeedback {
  tripId: string;
  accepted: boolean;
  timestamp: number;
  feedbackText?: string;
  reason?: string;
}

export interface AppState {
  preferences: UserPreferences | null;
  calendarConnected: boolean;
  calendarEvents: CalendarEvent[];
  generatedTrips: TripSuggestion[];
  feedbackHistory: TripFeedback[];
  lastEmailHtml: string | null;
}