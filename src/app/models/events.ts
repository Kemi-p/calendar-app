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

export const APPOINTMENT_COLOURS: Record<AppointmentType, string> = {
  'General Check-up': '#e57373',
  'Blood Test': '#ef9a9a',

  'Follow-up': '#f0c27b',

  'Mental Health': '#b39ddb',

  'Prescription Refill': '#81c7a6',

  'Lab Results': '#7ec8d8',
};
