import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { School } from '../../core/models/models';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-school',
  standalone: true,
  imports: [CommonModule, FormsModule, IconsModule],
  template: `
    <div class="space-y-6 max-w-5xl">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Información Institucional</h2>
          <p class="text-sm text-slate-500 mt-0.5">
            Configuración de datos generales, identidad, autoridades y visión del colegio.
          </p>
        </div>
        <div>
          <button
            type="button"
            (click)="saveSchoolInfo()"
            [disabled]="isSaving() || isLoading()"
            class="btn-primary flex items-center gap-2"
          >
            <lucide-icon name="save" [size]="16"></lucide-icon>
            <span *ngIf="!isSaving()">Guardar Cambios</span>
            <span *ngIf="isSaving()">Guardando...</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="py-20 text-center text-slate-400">
        <svg class="animate-spin h-8 w-8 text-primary mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-sm">Cargando datos institucionales...</p>
      </div>

      <div *ngIf="!isLoading()" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- School Profile Badge Card -->
        <div class="card-smp p-6 flex flex-col items-center text-center space-y-4">
          <div class="w-24 h-24 p-3 rounded-2xl bg-slate-50 shadow-inner border border-slate-100 flex items-center justify-center">
            <img src="assets/logo.png" alt="SMP Logo" class="w-full h-full object-contain drop-shadow" />
          </div>

          <div>
            <h3 class="text-lg font-bold text-primary">{{ school().name || 'Colegio SMP' }}</h3>
            <p class="text-xs text-slate-500 mt-0.5">Institución Educativa</p>
          </div>

          <div class="w-full h-px bg-slate-100"></div>

          <div class="w-full text-left space-y-2.5 text-xs">
            <div>
              <span class="text-slate-400 font-semibold block text-[10px] uppercase">Director / Principal:</span>
              <span class="font-bold text-slate-800">{{ school().principal || 'No asignado' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block text-[10px] uppercase">Teléfono:</span>
              <span class="font-medium text-slate-700 font-mono">{{ school().phone || 'No registrado' }}</span>
            </div>
            <div>
              <span class="text-slate-400 font-semibold block text-[10px] uppercase">Correo:</span>
              <span class="font-medium text-slate-700">{{ school().email || 'No registrado' }}</span>
            </div>
          </div>
        </div>

        <!-- School Information Form (2 Spans) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- General Details Card -->
          <div class="card-smp p-6 space-y-4">
            <h4 class="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
              <lucide-icon name="building" [size]="16" class="text-primary"></lucide-icon>
              <span>Datos Generales</span>
            </h4>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre Institucional *</label>
              <input
                type="text"
                [(ngModel)]="school().name"
                class="input-smp"
                placeholder="Nombre oficial del colegio"
                required
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Director(a) General</label>
                <input
                  type="text"
                  [(ngModel)]="school().principal"
                  class="input-smp"
                  placeholder="Nombre de la máxima autoridad"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Dirección de la Sede</label>
                <input
                  type="text"
                  [(ngModel)]="school().address"
                  class="input-smp"
                  placeholder="Av. Principal 123"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Teléfono / Central</label>
                <input
                  type="text"
                  [(ngModel)]="school().phone"
                  class="input-smp"
                  placeholder="999888777"
                />
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico Oficial</label>
                <input
                  type="email"
                  [(ngModel)]="school().email"
                  class="input-smp"
                  placeholder="contacto@smp.edu.pe"
                />
              </div>
            </div>
          </div>

          <!-- Mission, Vision & Values Card -->
          <div class="card-smp p-6 space-y-4">
            <h4 class="font-bold text-slate-800 text-sm border-b pb-2 flex items-center gap-2">
              <lucide-icon name="target" [size]="16" class="text-primary"></lucide-icon>
              <span>Misión, Visión y Principios</span>
            </h4>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Misión Institucional</label>
              <textarea
                [(ngModel)]="school().mission"
                rows="3"
                class="input-smp"
                placeholder="Propósito educativo y formativo..."
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Visión de Futuro</label>
              <textarea
                [(ngModel)]="school().vision"
                rows="3"
                class="input-smp"
                placeholder="Metas y proyección institucional a largo plazo..."
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Valores Fundamentales</label>
              <input
                type="text"
                [(ngModel)]="school().values"
                class="input-smp"
                placeholder="Ej: Responsabilidad, Respeto, Honestidad, Solidaridad"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class SchoolComponent implements OnInit {
  school = signal<School>({
    id: 1,
    name: '',
    address: '',
    phone: '',
    email: '',
    principal: '',
    mission: '',
    vision: '',
    values: '',
  });

  isLoading = signal(true);
  isSaving = signal(false);

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadSchoolInfo();
  }

  loadSchoolInfo() {
    this.isLoading.set(true);
    this.apiService.get<School>('/school').subscribe({
      next: (data) => {
        this.school.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar datos institucionales.');
        this.isLoading.set(false);
      },
    });
  }

  saveSchoolInfo() {
    const payload = this.school();
    if (!payload.name) {
      this.toastService.warning('El nombre de la institución es obligatorio.');
      return;
    }

    this.isSaving.set(true);
    this.apiService.put<School>('/school', payload).subscribe({
      next: (updated) => {
        this.school.set(updated);
        this.isSaving.set(false);
        this.toastService.success('Información institucional actualizada exitosamente.');
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Error al guardar cambios.');
        this.isSaving.set(false);
      },
    });
  }
}
