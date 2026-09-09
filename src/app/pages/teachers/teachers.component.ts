import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Teacher } from '../../core/models/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Plana Docente</h2>
          <p class="text-sm text-slate-500 mt-0.5">Gestión de profesores, especialidades y contactos del colegio.</p>
        </div>
        <div>
          <button (click)="openCreateModal()" class="btn-primary flex items-center gap-2">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            <span>Registrar Docente</span>
          </button>
        </div>
      </div>

      <!-- Search bar -->
      <div class="card-smp p-4 flex items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <lucide-icon name="search" [size]="16"></lucide-icon>
          </span>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Buscar por nombres, apellidos o especialidad..."
            class="input-smp pl-9"
          />
        </div>
        <div class="text-xs font-semibold text-slate-500">
          Total: <span class="text-primary font-bold">{{ filteredTeachers().length }}</span> docentes
        </div>
      </div>

      <!-- Teachers Table / List -->
      <div class="card-smp p-0 overflow-hidden">
        <div *ngIf="isLoading()" class="py-16 text-center text-slate-400">
          <svg class="animate-spin h-7 w-7 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p class="text-xs">Cargando docentes...</p>
        </div>

        <div *ngIf="!isLoading() && filteredTeachers().length === 0" class="py-16 text-center text-slate-400 flex flex-col items-center">
          <lucide-icon name="graduation-cap" [size]="44" class="text-slate-300 mb-2"></lucide-icon>
          <p class="text-sm font-medium text-slate-600">No hay docentes registrados</p>
          <p class="text-xs text-slate-400 mt-0.5">Registra un nuevo docente para comenzar a asignar horarios.</p>
        </div>

        <div *ngIf="!isLoading() && filteredTeachers().length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50 text-slate-600 font-semibold border-b uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-4">Docente</th>
                <th class="py-3 px-4">Especialidad</th>
                <th class="py-3 px-4">Teléfono / Celular</th>
                <th class="py-3 px-4">Correo Electrónico</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let t of filteredTeachers()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3.5 px-4 font-bold text-slate-900">
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {{ t.firstName.charAt(0) }}{{ t.lastName.charAt(0) }}
                    </div>
                    <div>
                      <span>{{ t.lastName }}, {{ t.firstName }}</span>
                      <p class="text-[11px] font-normal text-slate-400 truncate max-w-xs">{{ t.address || '' }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3.5 px-4">
                  <span class="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-700 text-xs">
                    {{ t.specialty || 'General' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-slate-600 font-mono">{{ t.phone || '-' }}</td>
                <td class="py-3.5 px-4 text-slate-600">{{ t.email || '-' }}</td>
                <td class="py-3.5 px-4">
                  <span
                    class="px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    [ngClass]="t.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'"
                  >
                    {{ t.status || 'Activo' }}
                  </span>
                </td>
                <td class="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                  <button
                    (click)="goToSchedule(t.id)"
                    class="px-2.5 py-1 text-xs font-semibold text-secondary-hover bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors inline-flex items-center gap-1"
                    title="Ver Horario"
                  >
                    <lucide-icon name="calendar" [size]="13"></lucide-icon>
                    <span>Horario</span>
                  </button>
                  <button
                    (click)="openEditModal(t)"
                    class="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center gap-1"
                    title="Editar"
                  >
                    <lucide-icon name="pencil" [size]="13"></lucide-icon>
                    <span>Editar</span>
                  </button>
                  <button
                    (click)="confirmDelete(t)"
                    class="p-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center justify-center"
                    title="Eliminar"
                  >
                    <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Teacher Modal -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingTeacher() ? 'Editar Docente' : 'Registrar Nuevo Docente'"
        maxWidth="max-w-lg"
        (close)="closeModal()"
      >
        <div body class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nombres *</label>
              <input
                type="text"
                [(ngModel)]="formData.firstName"
                placeholder="Ej: Carlos Alberto"
                class="input-smp"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Apellidos *</label>
              <input
                type="text"
                [(ngModel)]="formData.lastName"
                placeholder="Ej: Mendoza Ramos"
                class="input-smp"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Especialidad</label>
              <input
                type="text"
                [(ngModel)]="formData.specialty"
                placeholder="Ej: Matemática, Comunicación, Ciencias"
                class="input-smp"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
              <select [(ngModel)]="formData.status" class="select-smp">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Celular / Teléfono</label>
              <input
                type="text"
                [(ngModel)]="formData.phone"
                placeholder="Ej: 987654321"
                class="input-smp"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                type="email"
                [(ngModel)]="formData.email"
                placeholder="Ej: docente@smp.edu.pe"
                class="input-smp"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Dirección de Domicilio</label>
            <input
              type="text"
              [(ngModel)]="formData.address"
              placeholder="Ej: Av. Los Próceres 456, Lima"
              class="input-smp"
            />
          </div>
        </div>

        <div footer>
          <button type="button" (click)="closeModal()" class="btn-outline">Cancelar</button>
          <button
            type="button"
            (click)="saveTeacher()"
            [disabled]="isSaving() || !formData.firstName || !formData.lastName"
            class="btn-primary"
          >
            <span *ngIf="!isSaving()">{{ editingTeacher() ? 'Guardar Cambios' : 'Registrar Docente' }}</span>
            <span *ngIf="isSaving()">Guardando...</span>
          </button>
        </div>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="isDeleteModalOpen()"
        title="Eliminar Docente"
        maxWidth="max-w-md"
        (close)="closeDeleteModal()"
      >
        <div body class="py-2">
          <p class="text-sm text-slate-700">
            ¿Confirmas la eliminación del docente
            <strong class="text-slate-900 font-bold">
              {{ deletingTeacher()?.firstName }} {{ deletingTeacher()?.lastName }}
            </strong>?
          </p>
          <p class="text-xs text-rose-500 mt-2">
            No se podrá deshacer esta acción y se liberarán los bloques asignados al docente.
          </p>
        </div>
        <div footer>
          <button type="button" (click)="closeDeleteModal()" class="btn-outline">Cancelar</button>
          <button type="button" (click)="executeDelete()" [disabled]="isSaving()" class="btn-danger flex items-center gap-1.5">
            <lucide-icon name="trash-2" [size]="14"></lucide-icon>
            <span>Eliminar</span>
          </button>
        </div>
      </app-modal>
    </div>
  `,
})
export class TeachersComponent implements OnInit {
  teachers = signal<Teacher[]>([]);
  searchQuery = '';
  isLoading = signal(true);
  isSaving = signal(false);

  // Modals
  isModalOpen = signal(false);
  editingTeacher = signal<Teacher | null>(null);

  isDeleteModalOpen = signal(false);
  deletingTeacher = signal<Teacher | null>(null);

  formData = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    specialty: '',
    status: 'Activo',
  };

  filteredTeachers = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.teachers();
    return this.teachers().filter((t) => {
      const full = `${t.firstName} ${t.lastName}`.toLowerCase();
      const spec = (t.specialty || '').toLowerCase();
      return full.includes(q) || spec.includes(q);
    });
  });

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.loadTeachers();
  }

  loadTeachers() {
    this.isLoading.set(true);
    this.apiService.get<Teacher[]>('/teachers').subscribe({
      next: (data) => {
        this.teachers.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar docentes.');
        this.isLoading.set(false);
      },
    });
  }

  goToSchedule(teacherId: number) {
    this.router.navigate(['/admin/schedules'], { queryParams: { teacherId } });
  }

  openCreateModal() {
    this.editingTeacher.set(null);
    this.formData = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      specialty: '',
      status: 'Activo',
    };
    this.isModalOpen.set(true);
  }

  openEditModal(teacher: Teacher) {
    this.editingTeacher.set(teacher);
    this.formData = {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      phone: teacher.phone || '',
      email: teacher.email || '',
      address: teacher.address || '',
      specialty: teacher.specialty || '',
      status: teacher.status || 'Activo',
    };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingTeacher.set(null);
  }

  saveTeacher() {
    if (!this.formData.firstName || !this.formData.lastName) return;
    this.isSaving.set(true);

    const payload = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      phone: this.formData.phone || undefined,
      email: this.formData.email || undefined,
      address: this.formData.address || undefined,
      specialty: this.formData.specialty || undefined,
      status: this.formData.status,
    };

    const current = this.editingTeacher();
    if (current) {
      this.apiService.put(`/teachers/${current.id}`, payload).subscribe({
        next: () => {
          this.toastService.success('Docente actualizado con éxito.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadTeachers();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al actualizar docente.');
          this.isSaving.set(false);
        },
      });
    } else {
      this.apiService.post('/teachers', payload).subscribe({
        next: () => {
          this.toastService.success('Docente registrado con éxito.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadTeachers();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al registrar docente.');
          this.isSaving.set(false);
        },
      });
    }
  }

  confirmDelete(teacher: Teacher) {
    this.deletingTeacher.set(teacher);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.deletingTeacher.set(null);
  }

  executeDelete() {
    const t = this.deletingTeacher();
    if (!t) return;

    this.isSaving.set(true);
    this.apiService.delete(`/teachers/${t.id}`).subscribe({
      next: () => {
        this.toastService.success('Docente eliminado correctamente.');
        this.isSaving.set(false);
        this.closeDeleteModal();
        this.loadTeachers();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Error al eliminar docente.');
        this.isSaving.set(false);
      },
    });
  }
}
