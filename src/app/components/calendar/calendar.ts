import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
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
  getHours,
  subWeeks,
  addWeeks,
} from 'date-fns';
import { HolidayService } from '../../services/holidayService';

export type CalendarView = 'month' | 'week' | 'year';
const week_hours = Array.from({ length: 14 }, (_, i) => i + 7);
@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
  private readonly holidayService = inject(HolidayService);

  weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  readonly isDark = input<boolean>(false);
  readonly darkToggle = output<void>();

  activeView = signal<CalendarView>('month');

  readonly currentDate = signal<Date>(new Date());

  private readonly holidayMap = signal<Map<string, string>>(new Map());

  readonly isLoading = signal(false);
  readonly loadError = signal(false);

  readonly displayMonth = computed(() => format(this.currentDate(), 'MMMM'));
  readonly displayYear = computed(() => getYear(this.currentDate()));

  //month
  readonly weeks = computed<CalendarDay[][]>(() => {
    const current = this.currentDate();
    const holidays = this.holidayMap();
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
      };
    });
  });

  readonly weekRange = computed(() => {
    const days = this.weekDays();
    const first = days[0].date;
    const last = days[6].date;
    if (getMonth(first) === getMonth(last)) {
      return `${format(first, 'd')} – ${format(last, 'd MMM yyyy')}`;
    }
    return `${format(first, 'd MMM')} – ${format(last, 'd MMM yyyy')}`;
  });

  readonly weekHours = week_hours;

  ngOnInit(): void {
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
  }

  next(): void {
    const view = this.activeView();
    if (view === 'month') this.currentDate.update((d) => addMonths(d, 1));
    else if (view === 'week') this.currentDate.update((d) => addWeeks(d, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  setView(view: CalendarView): void {
    this.activeView.set(view);
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
}
