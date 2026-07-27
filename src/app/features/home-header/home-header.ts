import { Component, inject } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-header',
  imports: [CommonModule],
  templateUrl: './home-header.html',
  styleUrl: './home-header.scss',
})
export class HomeHeader {
    private readonly eventService = inject(EventService);

  protected readonly event = this.eventService.selectedEvent;

}
