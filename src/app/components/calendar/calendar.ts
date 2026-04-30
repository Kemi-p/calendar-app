import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CalendarDay } from '../../models/calDay';

import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSaturday,
  isSunday,
  format,
  getYear,
  getMonth,
  subWeeks,
  addWeeks,
  subYears,
  addYears,
} from 'date-fns';
import { HolidayService } from '../../services/holidayService';

import { EventService } from '../../services/eventService';
import { ReminderService } from '../../services/reminderService';
import { EventForm } from '../event-form/event-form';
import { EventDetails } from '../event-details/event-details';
import { APPOINTMENT_COLOURS, CalEvent } from '../../models/events';

export type CalendarView = 'month' | 'week' | 'year';
const week_hours = Array.from({ length: 14 }, (_, i) => i + 7);
const rox_height_px = 48;

const view_start_hour = 7;
@Component({
  selector: 'app-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EventForm, EventDetails],
  templateUrl: './calendar.html',
  styleUrls: [
    './calendar.css',
    './calendar-week.css',
    './calendar-year.css',
    './calendar-events.css',
  ],
})
export class Calendar implements OnInit {
  private holidayService = inject(HolidayService);
  private eventService = inject(EventService);
  reminderService = inject(ReminderService);

  weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  weekDayLabelsShort = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  isDark = input<boolean>(false);
  darkToggle = output<void>();

  activeView = signal<CalendarView>('month');

  currentDate = signal<Date>(new Date());

  private holidayMap = signal<Map<string, string>>(new Map());

  isLoading = signal(false);
  loadError = signal(false);

  formDate = signal<string | null>(null);
  showForm = signal(false);

  detailEvent = signal<CalEvent | null>(null);
  showDetail = signal(false);

  showBlock = this.reminderService.showBlock;

  displayMonth = computed(() => format(this.currentDate(), 'MMMM'));
  displayYear = computed(() => getYear(this.currentDate()));

  private allEvents = this.eventService.events;
  //month
  weeks = computed<CalendarDay[][]>(() => {
    const current = this.currentDate();
    const holidays = this.holidayMap();
    const events = this.allEvents();
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start, end }).map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const holidayName = holidays.get(key) ?? null;
      return {
        date,
        isCurrentMonth: isSameMonth(date, current),
        isToday: isToday(date),
        isWeekend: isSaturday(date) || isSunday(date),
        isHoliday: holidayName !== null,
        holidayName,
        events: events.filter((e) => e.date === key),
      };
    });
    const rows: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  });

  //week
  weekDays = computed<CalendarDay[]>(() => {
    const current = this.currentDate();
    const holidays = this.holidayMap();
    const events = this.allEvents();
    const start = startOfWeek(current, { weekStartsOn: 1 });
    const end = endOfWeek(current, { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end }).map((date) => {
      const key = format(date, 'yyyy-MM-dd');
      const holidayName = holidays.get(key) ?? null;
      return {
        date,
        isCurrentMonth: isSameMonth(date, current),
        isToday: isToday(date),
        isWeekend: isSaturday(date) || isSunday(date),
        isHoliday: holidayName !== null,
        holidayName,
        events: events.filter((e) => e.date === key),
      };
    });
  });

  weekRange = computed(() => {
    const days = this.weekDays();
    const first = days[0].date;
    const last = days[6].date;
    if (getMonth(first) === getMonth(last)) {
      return `${format(first, 'd')} – ${format(last, 'd MMM yyyy')}`;
    }
    return `${format(first, 'd MMM')} – ${format(last, 'd MMM yyyy')}`;
  });

  weekHours = week_hours;

  //year
  monthLabels = computed(() =>
    Array.from({ length: 12 }, (_, i) => ({
      label: format(new Date(this.displayYear(), i, 1), 'MMMM'),
      short: format(new Date(this.displayYear(), i, 1), 'MMM'),
      index: i,
      isCurrent: new Date().getFullYear() === this.displayYear() && new Date().getMonth() === i,
    })),
  );

  yearMonthGrids = computed(() =>
    this.monthLabels().map((m) => {
      const ref = new Date(this.displayYear(), m.index, 1);
      const start = startOfWeek(startOfMonth(ref), { weekStartsOn: 1 });
      const end = endOfWeek(endOfMonth(ref), { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start, end }).map((date) => ({
        date,
        isCurrentMonth: isSameMonth(date, ref),
        isToday: isToday(date),
        isWeekend: isSaturday(date) || isSunday(date),
        isHoliday: false,
        holidayName: null,
        events: [],
      }));
      const rows: CalendarDay[][] = [];
      for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
      return { ...m, rows };
    }),
  );

  ngOnInit(): void {
    this.reminderService.start();
    this.loadHolidaysAfterFirstPaint();
  }

  private loadHolidaysAfterFirstPaint(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.loadHolidays());
    });
  }

  private loadHolidays(): void {
    this.isLoading.set(true);
    this.holidayService.getHolidays().subscribe({
      next: (map) => {
        this.holidayMap.set(map);
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  onDarkToggle(): void {
    this.darkToggle.emit();
  }

  prev(): void {
    const view = this.activeView();
    if (view === 'month') this.currentDate.update((d) => subMonths(d, 1));
    else if (view === 'week') this.currentDate.update((d) => subWeeks(d, 1));
    else this.currentDate.update((d) => subYears(d, 1));
  }

  next(): void {
    const view = this.activeView();
    if (view === 'month') this.currentDate.update((d) => addMonths(d, 1));
    else if (view === 'week') this.currentDate.update((d) => addWeeks(d, 1));
    else this.currentDate.update((d) => addYears(d, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  setView(view: CalendarView): void {
    this.activeView.set(view);
  }

  jumpToMonth(monthIndex: number): void {
    this.currentDate.update((d) => new Date(getYear(d), monthIndex, 1));
    this.activeView.set('month');
  }

  formatDay(date: Date): string {
    return format(date, 'd');
  }
  formatHour(h: number): string {
    return `${h.toString().padStart(2, '0')}:00`;
  }
  formatWeekDay(date: Date): string {
    return format(date, 'EEE d');
  }
  formatDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  eventColour(event: CalEvent): string {
    if (event.appointmentType && APPOINTMENT_COLOURS[event.appointmentType]) {
      return APPOINTMENT_COLOURS[event.appointmentType];
    }
    return 'var(--p-primary-color)';
  }

  openFormForDay(dateStr: string, $event: MouseEvent): void {
    $event.stopPropagation();
    this.formDate.set(dateStr);
    this.showForm.set(true);
  }

  openFormBlank(): void {
    this.formDate.set(null);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.formDate.set(null);
  }

  openDetail(event: CalEvent, $event: MouseEvent): void {
    $event.stopPropagation();
    this.detailEvent.set(event);
    this.showDetail.set(true);
  }

  closeDetail(): void {
    this.showDetail.set(false);
    this.detailEvent.set(null);
  }

  dismissBlock(): void {
    this.reminderService.dismiss();
  }

  eventStyle(event: CalEvent): { top: string; height: string; background: string } {
    const [h, m] = event.time.split(':').map(Number);
    const offsetHours = h - view_start_hour + m / 60;
    const top = offsetHours * rox_height_px;
    const height = rox_height_px * 0.75;
    const bg =
      event.appointmentType && APPOINTMENT_COLOURS[event.appointmentType]
        ? APPOINTMENT_COLOURS[event.appointmentType]
        : 'var(--p-primary-color)';
    return { top: `${top}px`, height: `${height}px`, background: bg };
  }
}
