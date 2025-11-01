import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './core/layout/nav/nav';
import { FooterComponent } from './core/layout/footer/footer';
import { SidebarComponent } from './core/layout/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [RouterOutlet, NavbarComponent, FooterComponent, SidebarComponent],
})
export class App {}
