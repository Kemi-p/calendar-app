import { Injectable, signal } from '@angular/core';
import { CalEvent } from '../models/events';

const STORAGE_KEY = 'medcal_events';

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly events = signal<CalEvent[]>(this.load());

  getByDate(date: string): CalEvent[] {
    return this.events().filter((e) => e.date === date);
  }

  add(event: Omit<CalEvent, 'id'>): void {
    const newEvent: CalEvent = { ...event, id: crypto.randomUUID() };
    this.events.update((all) => {
      const next = [...all, newEvent];
      this.persist(next);
      return next;
    });
  }

  remove(id: string): void {
    this.events.update((all) => {
      const next = all.filter((e) => e.id !== id);
      this.persist(next);
      return next;
    });
  }

  private load(): CalEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist(events: CalEvent[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {}
  }
}
