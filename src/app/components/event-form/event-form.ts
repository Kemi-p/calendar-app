import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { format } from 'date-fns';

import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { APPOINTMENT_COLOURS, AppointmentType, EventType } from '../../models/events';

import { EventService } from '../../services/eventService';

const APPOINTMENT_TYPES: AppointmentType[] = [
  'General Check-up',
  'Blood Test',
  'Follow-up',
  'Mental Health',
  'Prescription Refill',
  'Lab Results',
];

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
  ],
  templateUrl: './event-form.html',
  styleUrls: ['./event-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventForm {
  private fb = inject(FormBuilder);
  private eventService = inject(EventService);

  initialDate = input<string | null>(null);
  visible = input.required<boolean>();
  close = output<void>();

  appointmentTypes = APPOINTMENT_TYPES;
  appointmentColours = APPOINTMENT_COLOURS;

  selectedType = signal<EventType>('appointment');
  isAppointment = computed(() => this.selectedType() === 'appointment');

  timeValue = signal<Date>(new Date());

  form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', Validators.maxLength(300)],
    date: [null as Date | null, Validators.required],
    appointmentType: [null as AppointmentType | null],
  });

  constructor() {
    effect(() => {
      if (!this.visible()) return;

      this.form.patchValue({
        date: this.dateFromKey(this.initialDate()) ?? new Date(),
      });
    });
  }

  onTypeChange(value: EventType): void {
    this.selectedType.set(value);
    if (value === 'reminder') {
      this.form.patchValue({ appointmentType: null });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const dateStr = format(raw.date!, 'yyyy-MM-dd');

    const t = this.timeValue();
    const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    this.eventService.add({
      title: raw.title!,
      description: raw.description ?? '',
      date: dateStr,
      time: timeStr,
      type: this.selectedType(),
      appointmentType: this.isAppointment() ? raw.appointmentType : null,
    });

    this.reset();
    this.close.emit();
  }

  cancel(): void {
    this.reset();
    this.close.emit();
  }

  private reset(): void {
    this.form.reset();
    this.selectedType.set('appointment');
    this.timeValue.set(new Date());
  }

  private dateFromKey(value: string | null): Date | null {
    if (!value) return null;

    const [year, month, day] = value.split('-').map(Number);
    if (!year || !month || !day) return null;

    return new Date(year, month - 1, day);
  }

  colourFor(type: AppointmentType): string {
    return APPOINTMENT_COLOURS[type];
  }
}
