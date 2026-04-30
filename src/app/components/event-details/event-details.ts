import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CalEvent, APPOINTMENT_COLOURS } from '../../models/events';
import { EventService } from '../../services/eventService';

@Component({
  selector: 'app-event-details',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DialogModule, ButtonModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private eventService = inject(EventService);

  event = input.required<CalEvent | null>();
  visible = input.required<boolean>();
  close = output<void>();

  get colour(): string {
    const e = this.event();
    if (!e || !e.appointmentType) return 'var(--p-primary-color)';
    return APPOINTMENT_COLOURS[e.appointmentType];
  }

  delete(): void {
    const e = this.event();
    if (e) this.eventService.remove(e.id);
    this.close.emit();
  }

  dismiss(): void {
    this.close.emit();
  }

  onVisibleChange(isVisible: boolean): void {
    if (!isVisible) {
      this.dismiss();
    }
  }
}
