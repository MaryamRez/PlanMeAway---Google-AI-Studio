import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, CalendarEvent, TripSuggestion, TripFeedback } from "../types";

const tripSchema = {
  type: Type.OBJECT,
  properties: {
    suggestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          destination: { type: Type.STRING },
          dates: { type: Type.STRING, description: "Format: YYYY-MM-DD to YYYY-MM-DD" },
          totalPrice: { type: Type.NUMBER },
          currency: { type: Type.STRING },
          summary: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
          flight: {
            type: Type.OBJECT,
            properties: {
              airline: { type: Type.STRING },
              flightNumber: { type: Type.STRING },
              departureAirport: { type: Type.STRING },
              arrivalAirport: { type: Type.STRING },
              departureTime: { type: Type.STRING },
              arrivalTime: { type: Type.STRING },
              price: { type: Type.NUMBER },
            },
            required: ["airline", "flightNumber", "departureAirport", "arrivalAirport", "departureTime", "arrivalTime", "price"],
          },
          hotel: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              address: { type: Type.STRING },
              pricePerNight: { type: Type.NUMBER },
            },
            required: ["name", "pricePerNight"],
          },
        },
        required: ["id", "destination", "totalPrice", "flight", "hotel", "summary"],
      },
    },
  },
  required: ["suggestions"],
};

// Helper to clean markdown code blocks from JSON strings
const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  let cleaned = text.trim();
  // Remove ```json ... ``` or ``` ... ``` wrappers
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return cleaned;
};

export const generateTripSuggestions = async (
  prefs: UserPreferences,
  travelEvent: CalendarEvent,
  feedbackHistory: TripFeedback[]
): Promise<TripSuggestion[]> => {
  
  const declined = feedbackHistory.filter(f => !f.accepted);
  const accepted = feedbackHistory.filter(f => f.accepted);

  let feedbackContext = "";
  if (declined.length > 0) {
    feedbackContext += `\nAvoid suggestions similar to these declined ones (User feedback included): ${JSON.stringify(declined.map(d => ({ id: d.tripId, reason: d.reason, feedback: d.feedbackText })))}.`;
  }
  if (accepted.length > 0) {
    feedbackContext += `\nThe user previously accepted these types of trips: ${JSON.stringify(accepted.map(a => ({ id: a.tripId, feedback: a.feedbackText })))}.`;
  }

  const prompt = `
    You are an expert travel agent.
    User Preferences:
    - Origin City: ${prefs.originCity}
    - Preferred Departure Airport: ${prefs.preferredAirport}
    - Budget: ${prefs.budget} ${prefs.currency}
    - Activity Level: ${prefs.activityLevel}
    - Interests: ${prefs.interests.join(", ")}
    - Excluded: ${prefs.excludedDestinations.join(", ")}

    Calendar Event Trigger:
    - Event: "${travelEvent.title}"
    - Dates: ${travelEvent.start} to ${travelEvent.end}

    Task:
    Find the 5 best value (cheapest but comfortable) flight and hotel combinations for this specific date range and user profile.
    ${feedbackContext}
    
    IMPORTANT:
    - Flights must originate from the user's preferred airport (${prefs.preferredAirport}).
    - Ensure flight times and duration are realistic for the destination.
    - Ensure the total price is within or close to the budget.
    - Generate realistic mock data for specific airlines, flight numbers, and hotels.
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tripSchema,
        systemInstruction: "You are a helpful travel assistant focusing on budget optimization and personalization.",
      },
    });

    const rawText = response.text || "{ \"suggestions\": [] }";
    const cleanedJson = cleanJsonString(rawText);
    const data = JSON.parse(cleanedJson);
    
    return data.suggestions || [];
  } catch (error) {
    console.error("Gemini API Error in generateTripSuggestions:", error);
    throw error; 
  }
};

export const generateEmailContent = async (suggestions: TripSuggestion[], userName: string = "Traveler"): Promise<string> => {
  const prompt = `
    Create a professional, responsive HTML email template.
    Subject: Your Top 5 Travel Recommendations
    
    Content:
    - Greeting to ${userName}.
    - A brief summary table of the 5 suggestions provided below.
    - Detailed sections for each suggestion (Destination, Price, Flight, Hotel, Dates).
    - Explicitly mention flight route (e.g. SFO -> LHR) and times.
    - For EACH suggestion, include a simulated "Accept" and "Decline" button/link. 
      (Note: These links won't work in a real email client without a backend, but style them to look functional).
    - Use inline CSS for styling. Theme: Clean, Modern, Blue/Teal.
    
    Suggestions Data:
    ${JSON.stringify(suggestions)}
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "text/plain", 
      },
    });

    return response.text || "<p>Error generating email.</p>";
  } catch (error) {
    console.error("Email Generation Error:", error);
    throw error;
  }
};