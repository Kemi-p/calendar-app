import { Component, OnInit, signal } from '@angular/core';
import { Calendar } from './components/calendar/calendar';

@Component({
  selector: 'app-root',
  imports: [Calendar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected readonly title = signal('calendar-app');
  readonly isDark = signal(false);

  ngOnInit(): void {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDark.set(prefersDark);
    this.applyTheme(prefersDark);
  }

  toggleDark(): void {
    this.isDark.update((v) => !v);
    this.applyTheme(this.isDark());
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('app-dark', dark);
  }
}
