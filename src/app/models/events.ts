export type AppointmentType =
  | 'General Check-up'
  | 'Blood Test'
  | 'Follow-up'
  | 'Mental Health'
  | 'Prescription Refill'
  | 'Lab Results';

export type EventType = 'appointment' | 'reminder';

export interface CalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: EventType;
  appointmentType: AppointmentType | null;
}

// Colour per appointment type — used in the day cell badge
export const APPOINTMENT_COLOURS: Record<AppointmentType, string> = {
  'General Check-up': '#3b82f6',
  'Blood Test': '#ef4444',
  'Follow-up': '#f59e0b',
  'Mental Health': '#8b5cf6',
  'Prescription Refill': '#10b981',
  'Lab Results': '#06b6d4',
};
