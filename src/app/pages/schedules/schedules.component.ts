import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Teacher, Schedule } from '../../core/models/models';
import { SCHEDULE_BLOCKS, SCHEDULE_DAYS } from '../../core/constants/schedule-constants';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-schedules',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconsModule],
  template: `
    <div class="space-y-6">
      <!-- Header with Export Actions -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Horarios Académicos</h2>
          <p class="text-sm text-slate-500 mt-0.5">
            Distribución pedagógica semanal y generación de horarios en Excel.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            (click)="exportAllSchedules()"
            [disabled]="isExportingAll()"
            class="btn-secondary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-2"
            title="Descargar libro Excel con todas las hojas de docentes"
          >
            <lucide-icon name="file-spreadsheet" [size]="16"></lucide-icon>
            <span *ngIf="!isExportingAll()">Exportar Todos (Excel)</span>
            <span *ngIf="isExportingAll()">Generando...</span>
          </button>
          <button
            type="button"
            (click)="exportTeacherSchedule()"
            [disabled]="!selectedTeacherId() || isExportingTeacher()"
            class="btn-outline text-xs sm:text-sm py-2 px-3.5 bg-white shadow-sm flex items-center gap-2"
            title="Descargar horario del docente seleccionado"
          >
            <lucide-icon name="download" [size]="16"></lucide-icon>
            <span *ngIf="!isExportingTeacher()">Exportar Docente (Excel)</span>
            <span *ngIf="isExportingTeacher()">Generando...</span>
          </button>
        </div>
      </div>

      <!-- Teacher Selector Bar -->
      <div class="card-smp p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div class="flex-1 max-w-md">
          <label class="block text-xs font-semibold text-slate-600 mb-1.5">Seleccionar Docente</label>
          <select
            [ngModel]="selectedTeacherId()"
            (ngModelChange)="onTeacherChange($event)"
            class="select-smp font-semibold text-sm"
          >
            <option [ngValue]="null" disabled>-- Selecciona un docente --</option>
            <option *ngFor="let t of teachers()" [ngValue]="t.id">
              {{ t.lastName }}, {{ t.firstName }} ({{ t.specialty || 'General' }})
            </option>
          </select>
        </div>

        <div *ngIf="currentTeacher()" class="flex-1 border-t md:border-t-0 md:border-l md:pl-6 pt-3 md:pt-0">
          <p class="text-xs text-slate-400 font-medium">Docente activo:</p>
          <p class="text-sm font-bold text-slate-900">
            {{ currentTeacher()?.firstName }} {{ currentTeacher()?.lastName }}
          </p>
          <p class="text-xs text-slate-500">
            Especialidad: <strong>{{ currentTeacher()?.specialty || 'Sin especialidad' }}</strong> |
            Celular: <strong>{{ currentTeacher()?.phone || 'No registrado' }}</strong>
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="py-16 text-center text-slate-400">
        <svg class="animate-spin h-7 w-7 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <p class="text-xs">Cargando horario semanal...</p>
      </div>

      <!-- If no teacher selected -->
      <div *ngIf="!isLoading() && !selectedTeacherId()" class="card-smp text-center py-16 text-slate-400 flex flex-col items-center">
        <lucide-icon name="calendar" [size]="44" class="text-slate-300 mb-2"></lucide-icon>
        <h3 class="text-base font-bold text-slate-700 mt-2">Selecciona un docente para ver y gestionar su horario</h3>
        <p class="text-xs text-slate-400 mt-1">
          Usa el selector superior para cargar la matriz semanal correspondiente.
        </p>
      </div>

      <!-- Weekly Matrix Grid -->
      <div *ngIf="!isLoading() && selectedTeacherId()" class="card-smp p-0 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-center">
            <thead>
              <tr class="bg-primary text-white text-xs font-bold uppercase tracking-wider">
                <th class="py-3 px-3 w-28 border-r border-blue-900/40">Bloque</th>
                <th class="py-3 px-3 w-32 border-r border-blue-900/40">Hora</th>
                <th *ngFor="let day of days" class="py-3 px-3 border-r border-blue-900/40 last:border-r-0">
                  {{ day }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-xs">
              <ng-container *ngFor="let b of blocks">
                <!-- Recreo Separator between Block 3 and 4 -->
                <tr *ngIf="b.block === 4" class="bg-amber-100/60 font-bold text-amber-900 border-y-2 border-amber-200">
                  <td colspan="7" class="py-2 text-center tracking-wider text-xs">
                    <div class="flex items-center justify-center gap-1.5">
                      <lucide-icon name="coffee" [size]="15" class="text-amber-800"></lucide-icon>
                      <span>RECREO (09:15 - 09:30)</span>
                    </div>
                  </td>
                </tr>

                <tr class="hover:bg-slate-50/50 transition-colors">
                  <!-- Block identifier -->
                  <td class="py-3 px-2 font-bold bg-slate-100 text-slate-700 border-r border-slate-200">
                    B{{ b.block }}
                  </td>

                  <!-- Block time -->
                  <td class="py-3 px-2 font-mono text-[11px] text-slate-500 bg-slate-50 border-r border-slate-200">
                    {{ b.startTime }} - {{ b.endTime }}
                  </td>

                  <!-- Day Cells -->
                  <td
                    *ngFor="let day of days"
                    (click)="onCellClick(day, b.block)"
                    class="py-2 px-2 border-r border-slate-200 last:border-r-0 cursor-pointer min-w-[130px] h-16 align-top transition-all"
                    [ngClass]="getSchedule(day, b.block) ? 'bg-blue-50/70 hover:bg-blue-100/70' : 'hover:bg-slate-100/60'"
                  >
                    <!-- Assigned Schedule Card -->
                    <div
                      *ngIf="getSchedule(day, b.block) as item"
                      class="bg-white p-2 rounded-lg border border-primary/20 shadow-xs text-left h-full flex flex-col justify-between"
                    >
                      <div>
                        <p class="font-bold text-primary text-xs leading-snug truncate">
                          {{ item.subject }}
                        </p>
                        <span *ngIf="item.gradeSection" class="inline-block bg-secondary/20 text-primary-dark font-semibold px-1.5 py-0.2 rounded text-[10px] mt-0.5">
                          {{ item.gradeSection }}
                        </span>
                      </div>
                      <p *ngIf="item.classroom" class="text-[10px] text-slate-400 font-medium truncate mt-1 flex items-center gap-1">
                        <lucide-icon name="map-pin" [size]="11"></lucide-icon>
                        <span>{{ item.classroom }}</span>
                      </p>
                    </div>

                    <!-- Empty slot placeholder -->
                    <div
                      *ngIf="!getSchedule(day, b.block)"
                      class="h-full flex items-center justify-center text-slate-300 hover:text-primary font-bold text-lg"
                    >
                      +
                    </div>
                  </td>
                </tr>
              </ng-container>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Assign / Edit Schedule Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingSchedule() ? 'Modificar Bloque Horario' : 'Asignar Clase a Horario'"
        maxWidth="max-w-md"
        (close)="closeModal()"
      >
        <div body class="space-y-4">
          <div class="bg-slate-50 p-3 rounded-xl border text-xs text-slate-600">
            <p>
              Docente: <strong>{{ currentTeacher()?.firstName }} {{ currentTeacher()?.lastName }}</strong>
            </p>
            <p class="mt-0.5">
              Día: <strong>{{ formData.day }}</strong> | Bloque: <strong>B{{ formData.block }}</strong>
            </p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Materia / Asignatura *</label>
            <input
              type="text"
              [(ngModel)]="formData.subject"
              placeholder="Ej: Matemática, Comunicación, Historia"
              class="input-smp"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Grado y Sección</label>
              <input
                type="text"
                [(ngModel)]="formData.gradeSection"
                placeholder="Ej: 3ro A, 5to B"
                class="input-smp"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Aula / Ambiente</label>
              <input
                type="text"
                [(ngModel)]="formData.classroom"
                placeholder="Ej: Aula 204, Lab 1"
                class="input-smp"
              />
            </div>
          </div>
        </div>

        <div footer class="flex items-center justify-between w-full">
          <div>
            <button
              *ngIf="editingSchedule()"
              type="button"
              (click)="removeSchedule()"
              [disabled]="isSaving()"
              class="text-xs text-rose-600 hover:underline font-semibold inline-flex items-center gap-1"
            >
              <lucide-icon name="trash-2" [size]="13"></lucide-icon>
              <span>Liberar Bloque</span>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <button type="button" (click)="closeModal()" class="btn-outline">Cancelar</button>
            <button
              type="button"
              (click)="saveSchedule()"
              [disabled]="isSaving() || !formData.subject"
              class="btn-primary"
            >
              <span *ngIf="!isSaving()">Guardar</span>
              <span *ngIf="isSaving()">Guardando...</span>
            </button>
          </div>
        </div>
      </app-modal>
    </div>
  `,
})
export class SchedulesComponent implements OnInit {
  teachers = signal<Teacher[]>([]);
  selectedTeacherId = signal<number | null>(null);
  schedules = signal<Schedule[]>([]);

  isLoading = signal(false);
  isSaving = signal(false);
  isExportingAll = signal(false);
  isExportingTeacher = signal(false);

  days = SCHEDULE_DAYS;
  blocks = SCHEDULE_BLOCKS;

  isModalOpen = signal(false);
  editingSchedule = signal<Schedule | null>(null);

  formData = {
    day: 'Lunes',
    block: 1,
    subject: '',
    gradeSection: '',
    classroom: '',
  };

  currentTeacher(): Teacher | undefined {
    const id = this.selectedTeacherId();
    if (!id) return undefined;
    return this.teachers().find((t) => t.id === id);
  }

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.apiService.get<Teacher[]>('/teachers').subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
        this.route.queryParams.subscribe((params) => {
          if (params['teacherId']) {
            const parsed = parseInt(params['teacherId'], 10);
            this.selectedTeacherId.set(parsed);
            this.loadSchedules(parsed);
          } else if (teachers.length > 0) {
            this.selectedTeacherId.set(teachers[0].id);
            this.loadSchedules(teachers[0].id);
          }
        });
      },
    });
  }

  onTeacherChange(id: number | null) {
    this.selectedTeacherId.set(id);
    if (id) {
      this.loadSchedules(id);
    } else {
      this.schedules.set([]);
    }
  }

  loadSchedules(teacherId: number) {
    this.isLoading.set(true);
    this.apiService.get<Schedule[]>('/schedules', { teacherId }).subscribe({
      next: (data) => {
        this.schedules.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar horarios del docente.');
        this.isLoading.set(false);
      },
    });
  }

  getSchedule(day: string, block: number): Schedule | undefined {
    return this.schedules().find((s) => s.day === day && s.block === block);
  }

  onCellClick(day: string, block: number) {
    const existing = this.getSchedule(day, block);
    if (existing) {
      this.editingSchedule.set(existing);
      this.formData = {
        day: existing.day,
        block: existing.block,
        subject: existing.subject || '',
        gradeSection: existing.gradeSection || '',
        classroom: existing.classroom || '',
      };
    } else {
      this.editingSchedule.set(null);
      this.formData = {
        day,
        block,
        subject: '',
        gradeSection: '',
        classroom: '',
      };
    }
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingSchedule.set(null);
  }

  saveSchedule() {
    const teacherId = this.selectedTeacherId();
    if (!teacherId || !this.formData.subject) return;

    this.isSaving.set(true);
    const payload = {
      teacherId,
      day: this.formData.day,
      block: this.formData.block,
      subject: this.formData.subject,
      gradeSection: this.formData.gradeSection || undefined,
      classroom: this.formData.classroom || undefined,
    };

    const current = this.editingSchedule();
    if (current) {
      this.apiService.put(`/schedules/${current.id}`, payload).subscribe({
        next: () => {
          this.toastService.success('Bloque horario actualizado.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadSchedules(teacherId);
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al actualizar bloque.');
          this.isSaving.set(false);
        },
      });
    } else {
      this.apiService.post('/schedules', payload).subscribe({
        next: () => {
          this.toastService.success('Clase asignada al horario.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadSchedules(teacherId);
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al asignar clase.');
          this.isSaving.set(false);
        },
      });
    }
  }

  removeSchedule() {
    const current = this.editingSchedule();
    const teacherId = this.selectedTeacherId();
    if (!current || !teacherId) return;

    this.isSaving.set(true);
    this.apiService.delete(`/schedules/${current.id}`).subscribe({
      next: () => {
        this.toastService.success('Bloque liberado exitosamente.');
        this.isSaving.set(false);
        this.closeModal();
        this.loadSchedules(teacherId);
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Error al liberar bloque.');
        this.isSaving.set(false);
      },
    });
  }

  exportTeacherSchedule() {
    const teacher = this.currentTeacher();
    if (!teacher) return;

    this.isExportingTeacher.set(true);
    this.apiService.getBlob(`/schedules/export/${teacher.id}`).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `horario_${teacher.lastName}_${teacher.firstName}.xlsx`);
        this.isExportingTeacher.set(false);
        this.toastService.success('Horario descargado correctamente.');
      },
      error: () => {
        this.toastService.error('Error al generar Excel del docente.');
        this.isExportingTeacher.set(false);
      },
    });
  }

  exportAllSchedules() {
    this.isExportingAll.set(true);
    this.apiService.getBlob('/schedules/export-all').subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'todos_los_horarios.xlsx');
        this.isExportingAll.set(false);
        this.toastService.success('Todos los horarios descargados en Excel.');
      },
      error: () => {
        this.toastService.error('Error al generar Excel general.');
        this.isExportingAll.set(false);
      },
    });
  }

  private downloadBlob(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
