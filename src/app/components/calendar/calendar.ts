import { Component, computed, signal } from '@angular/core';
import { CalendarDay } from '../../calDay';
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

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  weekDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  emptyCells = Array(35).fill(null);

  readonly currentDate = signal<Date>(new Date());

  readonly displayMonth = computed(() => format(this.currentDate(), 'MMMM'));
  readonly displayYear = computed(() => getYear(this.currentDate()));

  readonly weeks = computed<CalendarDay[][]>(() => {
    const current = this.currentDate();
    const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end }).map((date) => ({
      date,
      isCurrentMonth: isSameMonth(date, current),
      isToday: isToday(date),
      isWeekend: isSaturday(date) || isSunday(date),
    }));

    const rows: CalendarDay[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  });

  prev(): void {
    this.currentDate.update((curr) => subMonths(curr, 1));
  }

  next(): void {
    this.currentDate.update((curr) => addMonths(curr, 1));
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  formatDay(date: Date): string {
    return format(date, 'd');
  }
}
