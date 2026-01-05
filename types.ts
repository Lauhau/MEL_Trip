export interface FlightDetails {
  flightNumber: string;
  airline: string;
  departCode: string;
  arriveCode: string;
  departTerminal?: string;
  arriveTerminal?: string;
  duration?: string;
}

export interface TripEvent {
  id: string;
  time: string;
  title: string;
  location: string;
  lat?: number;
  lng?: number;
  notes?: string;
  type: 'food' | 'activity' | 'transport' | 'hotel' | 'flight'; // Added 'flight'
  bookingUrl?: string;
  navLink?: string;
  flightDetails?: FlightDetails; // New field for flight cards
}

export interface DayItinerary {
  day: number;
  date: string; // YYYY-MM-DD
  weekday: string;
  events: TripEvent[];
  weather: 'sunny' | 'cloudy' | 'rain' | 'partly-cloudy';
  temp: number;
  tips: string; // Used as Memo
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // In original currency (usually AUD)
  currency: 'AUD' | 'TWD';
  payer: string;
  involved: string[]; 
}

export interface BookingLink {
  id: string;
  title: string;
  type: 'hotel' | 'car' | 'flight' | 'ticket' | 'transport' | 'activity' | 'food';
  url: string;
  details: string;
}

export interface TodoCategory {
  id: string;
  label: string;
  color: string; // CSS classes for background/text
  isDefault?: boolean;
}

export interface TodoItem {
  id: string;
  text: string;
  isCompleted: boolean;
  category: string; // Changed from enum to string ID
}

export type ViewState = 'itinerary' | 'expenses' | 'links' | 'todo';

export const USERS = ['我', '旅伴']; // Traditional Chinese users