import { Reminder } from './reminder';
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName: string | null;
  reminders?: Reminder[];
}
