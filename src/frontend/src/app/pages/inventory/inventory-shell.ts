import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgFor } from '@angular/common';

const NAV = [
  { label: 'Items', path: '/inventory/items', icon: 'inventory_2' },
  { label: 'Warehouses', path: '/inventory/warehouses', icon: 'warehouse' },
  { label: 'Stock Levels', path: '/inventory/levels', icon: 'stacked_bar_chart' },
  { label: 'Movements', path: '/inventory/movements', icon: 'swap_vert' },
];

@Component({
  selector: 'app-inventory-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor],
  template: `
    <section class="space-y-6">
      <header class="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.4em] text-primary-500">Inventory</p>
        <div class="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 class="text-3xl font-bold text-slate-900">Inventory Operations</h1>
            <p class="text-sm text-slate-500">
              Manage items, warehouse capacity, and real-time stock movements.
            </p>
          </div>
        </div>
        <nav class="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-500">
          <a
            *ngFor="let item of nav"
            [routerLink]="item.path"
            routerLinkActive="bg-primary-600 text-white shadow-lg shadow-primary-500/30"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 transition hover:border-primary-200 hover:text-primary-600"
          >
            <span class="material-symbols-outlined text-base">{{ item.icon }}</span>
            {{ item.label }}
          </a>
        </nav>
      </header>
      <router-outlet></router-outlet>
    </section>
  `,
})
export class InventoryShellComponent {
  nav = NAV;
}