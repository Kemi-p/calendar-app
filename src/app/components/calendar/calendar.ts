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
} from 'date-fns';
import { HolidayService } from '../../services/holidayService';

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

  readonly currentDate = signal<Date>(new Date());

  private readonly holidayMap = signal<Map<string, string>>(new Map());

  readonly isLoading = signal(false);
  readonly loadError = signal(false);

  readonly displayMonth = computed(() => format(this.currentDate(), 'MMMM'));
  readonly displayYear = computed(() => getYear(this.currentDate()));

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
    this.currentDate.update((d) => subMonths(d, 1));
  }

  next(): void {
    this.currentDate.update((d) => addMonths(d, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  formatDay(date: Date): string {
    return format(date, 'd');
  }
}
