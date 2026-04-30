import { Injectable, OnDestroy, signal, inject } from '@angular/core';
import { format } from 'date-fns';
import { EventService } from './eventService';
import { CalEvent } from '../models/events';

@Injectable({ providedIn: 'root' })
export class ReminderService implements OnDestroy {
  private readonly eventService = inject(EventService);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly triggered = signal<CalEvent | null>(null);
  readonly showBlock = signal(false);

  // Track which event IDs have already fired today so i don't repeat
  private readonly fired = new Set<string>();

  start(): void {
    this.check();
    this.intervalId = setInterval(() => this.check(), 60_000);
  }

  dismiss(): void {
    this.showBlock.set(false);
    this.triggered.set(null);
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private check(): void {
    const now = new Date();
    const todayKey = format(now, 'yyyy-MM-dd');
    const nowTime = format(now, 'HH:mm');

    const due = this.eventService
      .getByDate(todayKey)
      .find((e) => e.time === nowTime && !this.fired.has(e.id));

    if (due) {
      this.fired.add(due.id);
      this.triggered.set(due);
      this.showBlock.set(true);

      setTimeout(() => this.showBlock.set(false), 4000);
    }
  }
}
