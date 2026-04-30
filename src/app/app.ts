import { Component, OnInit, signal } from '@angular/core';
import { Calendar } from './components/calendar/calendar';

@Component({
  selector: 'app-root',
  imports: [Calendar],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly isDark = signal(false);

  constructor() {
    this.applyTheme(false);
  }

  toggleDark(): void {
    this.isDark.update((v) => !v);
    this.applyTheme(this.isDark());
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('app-dark', dark);
  }
}
