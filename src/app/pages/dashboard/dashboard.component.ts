import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { InventoryStats, Group } from '../../core/models/models';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, IconsModule],
  template: `
    <div class="space-y-6">
      <!-- Header banner -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-primary to-slate-800 p-6 rounded-2xl text-white shadow-sm border border-slate-700/50">
        <div>
          <h2 class="text-2xl font-bold tracking-tight">Panel de Control</h2>
          <p class="text-sm text-blue-200 mt-1">
            Resumen en tiempo real del inventario, estado de bienes y actividad escolar.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/admin/inventory" class="btn-secondary text-xs sm:text-sm py-2 px-4 shadow flex items-center gap-2">
            <lucide-icon name="package" [size]="16"></lucide-icon>
            <span>Ver Inventario</span>
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="py-20 flex flex-col items-center justify-center text-slate-400">
        <svg class="animate-spin h-8 w-8 text-primary mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-sm">Cargando estadísticas del sistema...</p>
      </div>

      <div *ngIf="!isLoading()" class="space-y-6">
        <!-- 4 Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Total Items -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <lucide-icon name="package" [size]="24" class="text-blue-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Bienes</p>
              <h3 class="text-2xl font-extrabold text-slate-800 mt-0.5">{{ stats()?.total || 0 }}</h3>
              <span class="text-[11px] text-slate-400">Unidades en registro</span>
            </div>
          </div>

          <!-- Bueno -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <lucide-icon name="check-circle-2" [size]="24" class="text-emerald-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado Bueno</p>
              <h3 class="text-2xl font-extrabold text-emerald-600 mt-0.5">{{ stats()?.byStatus?.Bueno || 0 }}</h3>
              <span class="text-[11px] text-slate-400">En óptimas condiciones</span>
            </div>
          </div>

          <!-- Regular -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <lucide-icon name="alert-triangle" [size]="24" class="text-amber-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado Regular</p>
              <h3 class="text-2xl font-extrabold text-amber-600 mt-0.5">{{ stats()?.byStatus?.Regular || 0 }}</h3>
              <span class="text-[11px] text-slate-400">Uso operativo parcial</span>
            </div>
          </div>

          <!-- Malo -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center">
              <lucide-icon name="x-circle" [size]="24" class="text-rose-600"></lucide-icon>
            </div>
            <div>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Requiere Atención</p>
              <h3 class="text-2xl font-extrabold text-rose-600 mt-0.5">{{ stats()?.byStatus?.Malo || 0 }}</h3>
              <span class="text-[11px] text-rose-500 font-medium">Bienes deteriorados</span>
            </div>
          </div>
        </div>

        <!-- Groups Distribution Cards -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
              <lucide-icon name="tags" [size]="18" class="text-primary"></lucide-icon>
              <span>Distribución por Grupos</span>
            </h3>
            <a routerLink="/admin/categories" class="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
              <span>Administrar Grupos</span>
              <span>&rarr;</span>
            </a>
          </div>

          <div *ngIf="groups().length === 0" class="text-center py-6 text-slate-400 text-sm">
            No se han registrado grupos en el sistema.
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <div
              *ngFor="let g of groups()"
              class="bg-slate-50 hover:bg-slate-100 p-4 rounded-xl border border-slate-200/80 text-center transition-all cursor-pointer"
              routerLink="/admin/inventory"
              [queryParams]="{ groupId: g.id }"
            >
              <div class="flex justify-center mb-1 text-primary">
                <lucide-icon name="folder" [size]="24"></lucide-icon>
              </div>
              <p class="font-bold text-slate-800 text-xs truncate">{{ g.name }}</p>
              <p class="text-xs text-slate-500 font-semibold mt-1">
                {{ stats()?.byGroup?.[g.id] || 0 }} ítems
              </p>
            </div>
          </div>
        </div>

        <!-- Two Columns: Critical Attention & Recent Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Items requiring attention -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-rose-800 flex items-center gap-2">
                  <lucide-icon name="alert-triangle" [size]="18" class="text-rose-600"></lucide-icon>
                  Ítems que Requieren Atención (Estado Malo)
                </h3>
              </div>

              <div *ngIf="!stats()?.attention?.length" class="text-center py-8 text-slate-400 text-sm flex flex-col items-center gap-2">
                <lucide-icon name="check-circle-2" [size]="28" class="text-emerald-500"></lucide-icon>
                <span>No hay ningún bien registrado en mal estado.</span>
              </div>

              <div *ngIf="stats()?.attention?.length" class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th class="py-2.5 px-3">Nombre</th>
                      <th class="py-2.5 px-3">Ubicación</th>
                      <th class="py-2.5 px-3">Cant.</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr *ngFor="let item of stats()?.attention" class="hover:bg-rose-50/50 transition-colors">
                      <td class="py-2.5 px-3 font-semibold text-slate-800">{{ item.name }}</td>
                      <td class="py-2.5 px-3 text-slate-600">{{ item.location || 'Sin asignar' }}</td>
                      <td class="py-2.5 px-3 font-bold text-rose-600">{{ item.quantity }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t text-right">
              <a routerLink="/admin/inventory" [queryParams]="{ status: 'Malo' }" class="text-xs text-rose-600 hover:underline font-semibold">
                Ver todos los ítems críticos &rarr;
              </a>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-bold text-slate-800 flex items-center gap-2">
                  <lucide-icon name="clock" [size]="18" class="text-slate-600"></lucide-icon>
                  <span>Actividad Reciente</span>
                </h3>
              </div>

              <div *ngIf="!stats()?.recent?.length" class="text-center py-8 text-slate-400 text-sm flex flex-col items-center gap-2">
                <lucide-icon name="package" [size]="28" class="text-slate-300"></lucide-icon>
                <span>No hay actividad reciente registrada.</span>
              </div>

              <div *ngIf="stats()?.recent?.length" class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 text-slate-600 font-semibold border-b">
                    <tr>
                      <th class="py-2.5 px-3">Ítem</th>
                      <th class="py-2.5 px-3">Categoría</th>
                      <th class="py-2.5 px-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr *ngFor="let item of stats()?.recent" class="hover:bg-slate-50 transition-colors">
                      <td class="py-2.5 px-3 font-semibold text-slate-800">{{ item.name }}</td>
                      <td class="py-2.5 px-3 text-slate-600">{{ item.category?.name || '-' }}</td>
                      <td class="py-2.5 px-3">
                        <span
                          class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          [ngClass]="{
                            'bg-emerald-100 text-emerald-800': item.status === 'Bueno',
                            'bg-amber-100 text-amber-800': item.status === 'Regular',
                            'bg-rose-100 text-rose-800': item.status === 'Malo'
                          }"
                        >
                          {{ item.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t text-right">
              <a routerLink="/admin/inventory" class="text-xs text-primary hover:underline font-semibold">
                Ver inventario completo &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  stats = signal<InventoryStats | null>(null);
  groups = signal<Group[]>([]);
  isLoading = signal(true);

  constructor(private readonly apiService: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.apiService.get<InventoryStats>('/inventory/stats').subscribe({
      next: (data) => {
        this.stats.set(data);
        this.apiService.get<Group[]>('/groups').subscribe({
          next: (groups) => {
            this.groups.set(groups);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => this.isLoading.set(false),
    });
  }
}
