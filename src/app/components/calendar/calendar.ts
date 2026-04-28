import { Component } from '@angular/core';

@Component({
  selector: 'app-calendar',
  imports: [],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar {
  weekDayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  emptyCells = Array(35).fill(null);
}
