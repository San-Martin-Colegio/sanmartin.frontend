import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Group, Category } from '../../core/models/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Grupos y Categorías</h2>
          <p class="text-sm text-slate-500 mt-0.5">Organiza la clasificación jerárquica de los bienes del colegio.</p>
        </div>
        <div class="flex items-center gap-3">
          <button (click)="openGroupModal()" class="btn-outline flex items-center gap-2">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            <span>Nuevo Grupo</span>
          </button>
          <button (click)="openCategoryModal()" class="btn-primary flex items-center gap-2">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      <!-- Main Layout: Groups on Left, Categories on Right -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Groups Column -->
        <div class="card-smp p-5 space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <lucide-icon name="folder" [size]="16" class="text-primary"></lucide-icon>
              <span>Grupos Principales</span>
            </h3>
            <span class="text-xs bg-slate-100 font-bold px-2 py-0.5 rounded-full text-slate-600">
              {{ groups().length }}
            </span>
          </div>

          <div *ngIf="isLoading()" class="py-10 text-center text-slate-400 text-xs">Cargando grupos...</div>

          <div *ngIf="!isLoading() && groups().length === 0" class="py-10 text-center text-slate-400 text-xs">
            No hay grupos registrados. Haz clic en "Nuevo Grupo" para comenzar.
          </div>

          <div *ngIf="!isLoading() && groups().length > 0" class="space-y-2">
            <!-- "All" option -->
            <button
              type="button"
              (click)="selectGroup(null)"
              class="w-full text-left p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all"
              [ngClass]="selectedGroup() === null ? 'bg-primary text-white border-primary shadow-sm' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'"
            >
              <span>Todos los grupos</span>
              <span class="text-[10px] opacity-70">{{ totalCategories() }} categorías</span>
            </button>

            <!-- Group items -->
            <div
              *ngFor="let g of groups()"
              class="p-3 rounded-xl border transition-all flex items-center justify-between"
              [ngClass]="selectedGroup()?.id === g.id ? 'bg-primary/5 border-primary shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200'"
            >
              <div
                (click)="selectGroup(g)"
                class="flex-1 cursor-pointer flex items-center gap-2.5 overflow-hidden pr-2"
              >
                <lucide-icon name="tag" [size]="16" class="text-primary flex-shrink-0"></lucide-icon>
                <div class="truncate">
                  <p class="text-xs font-bold text-slate-800 truncate">{{ g.name }}</p>
                  <p class="text-[10px] text-slate-400 truncate">{{ g.description || 'Sin descripción' }}</p>
                </div>
              </div>

              <div class="flex items-center gap-1">
                <button
                  (click)="openGroupModal(g)"
                  class="p-1.5 text-slate-400 hover:text-primary rounded transition-colors"
                  title="Editar Grupo"
                >
                  <lucide-icon name="pencil" [size]="14"></lucide-icon>
                </button>
                <button
                  (click)="confirmDeleteGroup(g)"
                  class="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  title="Eliminar Grupo"
                >
                  <lucide-icon name="trash-2" [size]="14"></lucide-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories Column (2 spans) -->
        <div class="lg:col-span-2 card-smp p-5 space-y-4">
          <div class="flex items-center justify-between border-b pb-3">
            <div>
              <h3 class="font-bold text-slate-800 text-sm">
                Categorías:
                <span class="text-primary font-extrabold">
                  {{ selectedGroup() ? selectedGroup()?.name : 'Todas' }}
                </span>
              </h3>
              <p class="text-xs text-slate-400 mt-0.5">
                {{ filteredCategories().length }} categorías listadas
              </p>
            </div>
          </div>

          <div *ngIf="isLoading()" class="py-12 text-center text-slate-400 text-xs">Cargando categorías...</div>

          <div *ngIf="!isLoading() && filteredCategories().length === 0" class="py-12 text-center text-slate-400 text-xs">
            No se encontraron categorías asociadas a este grupo.
          </div>

          <div *ngIf="!isLoading() && filteredCategories().length > 0" class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-slate-600 font-semibold border-b">
                <tr>
                  <th class="py-2.5 px-3">Nombre</th>
                  <th class="py-2.5 px-3">Grupo Perteneciente</th>
                  <th class="py-2.5 px-3">Descripción</th>
                  <th class="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr *ngFor="let cat of filteredCategories()" class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-3 font-bold text-slate-800">{{ cat.name }}</td>
                  <td class="py-3 px-3">
                    <span class="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-[11px]">
                      {{ getGroupName(cat.groupId) }}
                    </span>
                  </td>
                  <td class="py-3 px-3 text-slate-500 max-w-xs truncate">{{ cat.description || '-' }}</td>
                  <td class="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                    <button
                      (click)="openCategoryModal(cat)"
                      class="px-2.5 py-1 font-semibold text-primary hover:bg-primary/10 rounded inline-flex items-center gap-1"
                    >
                      <lucide-icon name="pencil" [size]="13"></lucide-icon>
                      <span>Editar</span>
                    </button>
                    <button
                      (click)="confirmDeleteCategory(cat)"
                      class="px-2.5 py-1 font-semibold text-rose-600 hover:bg-rose-50 rounded inline-flex items-center gap-1"
                    >
                      <lucide-icon name="trash-2" [size]="13"></lucide-icon>
                      <span>Eliminar</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Group Modal -->
      <app-modal
        [isOpen]="isGroupModalOpen()"
        [title]="editingGroup() ? 'Editar Grupo' : 'Nuevo Grupo'"
        maxWidth="max-w-md"
        (close)="closeGroupModal()"
      >
        <div body class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Grupo *</label>
            <input
              type="text"
              [(ngModel)]="groupForm.name"
              placeholder="Ej: Mobiliario Escolar, Cómputo"
              class="input-smp"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              [(ngModel)]="groupForm.description"
              rows="2"
              placeholder="Breve descripción del grupo..."
              class="input-smp"
            ></textarea>
          </div>
        </div>
        <div footer>
          <button type="button" (click)="closeGroupModal()" class="btn-outline">Cancelar</button>
          <button
            type="button"
            (click)="saveGroup()"
            [disabled]="isSaving() || !groupForm.name"
            class="btn-primary"
          >
            <span *ngIf="!isSaving()">Guardar Grupo</span>
            <span *ngIf="isSaving()">Guardando...</span>
          </button>
        </div>
      </app-modal>

      <!-- Category Modal -->
      <app-modal
        [isOpen]="isCategoryModalOpen()"
        [title]="editingCategory() ? 'Editar Categoría' : 'Nueva Categoría'"
        maxWidth="max-w-md"
        (close)="closeCategoryModal()"
      >
        <div body class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Grupo *</label>
            <select [(ngModel)]="categoryForm.groupId" class="select-smp" required>
              <option [ngValue]="null" disabled>Selecciona un grupo</option>
              <option *ngFor="let g of groups()" [ngValue]="g.id">{{ g.name }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre de la Categoría *</label>
            <input
              type="text"
              [(ngModel)]="categoryForm.name"
              placeholder="Ej: Carpetas, Laptops, Proyectores"
              class="input-smp"
              required
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Descripción</label>
            <textarea
              [(ngModel)]="categoryForm.description"
              rows="2"
              placeholder="Detalle o especificaciones de la categoría..."
              class="input-smp"
            ></textarea>
          </div>
        </div>
        <div footer>
          <button type="button" (click)="closeCategoryModal()" class="btn-outline">Cancelar</button>
          <button
            type="button"
            (click)="saveCategory()"
            [disabled]="isSaving() || !categoryForm.name || !categoryForm.groupId"
            class="btn-primary"
          >
            <span *ngIf="!isSaving()">Guardar Categoría</span>
            <span *ngIf="isSaving()">Guardando...</span>
          </button>
        </div>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="isDeleteModalOpen()"
        title="Confirmar Eliminación"
        maxWidth="max-w-sm"
        (close)="closeDeleteModal()"
      >
        <div body class="py-2">
          <p class="text-sm text-slate-700">
            ¿Confirmas la eliminación de {{ deleteType === 'group' ? 'el grupo' : 'la categoría' }}
            <strong class="text-slate-900 font-bold">{{ deleteItemName }}</strong>?
          </p>
          <p class="text-xs text-rose-500 mt-2">
            No se podrá eliminar si contiene elementos o registros dependientes.
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
export class CategoriesComponent implements OnInit {
  groups = signal<Group[]>([]);
  categories = signal<Category[]>([]);
  selectedGroup = signal<Group | null>(null);

  isLoading = signal(true);
  isSaving = signal(false);

  // Group modal
  isGroupModalOpen = signal(false);
  editingGroup = signal<Group | null>(null);
  groupForm = { name: '', description: '' };

  // Category modal
  isCategoryModalOpen = signal(false);
  editingCategory = signal<Category | null>(null);
  categoryForm = { name: '', description: '', groupId: null as number | null };

  // Delete modal
  isDeleteModalOpen = signal(false);
  deleteType: 'group' | 'category' = 'group';
  deleteItemId = 0;
  deleteItemName = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
  ) {}

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading.set(true);
    this.apiService.get<Group[]>('/groups').subscribe({
      next: (groups) => {
        this.groups.set(groups);
        this.apiService.get<Category[]>('/categories').subscribe({
          next: (cats) => {
            this.categories.set(cats);
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
      },
      error: () => this.isLoading.set(false),
    });
  }

  selectGroup(g: Group | null) {
    this.selectedGroup.set(g);
  }

  totalCategories(): number {
    return this.categories().length;
  }

  filteredCategories(): Category[] {
    const sel = this.selectedGroup();
    if (!sel) return this.categories();
    return this.categories().filter((c) => c.groupId === sel.id);
  }

  getGroupName(groupId: number): string {
    const g = this.groups().find((item) => item.id === groupId);
    return g ? g.name : 'Sin grupo';
  }

  // Group actions
  openGroupModal(group?: Group) {
    if (group) {
      this.editingGroup.set(group);
      this.groupForm = { name: group.name, description: group.description || '' };
    } else {
      this.editingGroup.set(null);
      this.groupForm = { name: '', description: '' };
    }
    this.isGroupModalOpen.set(true);
  }

  closeGroupModal() {
    this.isGroupModalOpen.set(false);
    this.editingGroup.set(null);
  }

  saveGroup() {
    if (!this.groupForm.name) return;
    this.isSaving.set(true);
    const payload = { name: this.groupForm.name, description: this.groupForm.description };

    const current = this.editingGroup();
    if (current) {
      this.apiService.put(`/groups/${current.id}`, payload).subscribe({
        next: () => {
          this.toastService.success('Grupo actualizado correctamente.');
          this.isSaving.set(false);
          this.closeGroupModal();
          this.loadAll();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al actualizar grupo.');
          this.isSaving.set(false);
        },
      });
    } else {
      this.apiService.post('/groups', payload).subscribe({
        next: () => {
          this.toastService.success('Grupo creado correctamente.');
          this.isSaving.set(false);
          this.closeGroupModal();
          this.loadAll();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al crear grupo.');
          this.isSaving.set(false);
        },
      });
    }
  }

  confirmDeleteGroup(g: Group) {
    this.deleteType = 'group';
    this.deleteItemId = g.id;
    this.deleteItemName = g.name;
    this.isDeleteModalOpen.set(true);
  }

  // Category actions
  openCategoryModal(cat?: Category) {
    if (cat) {
      this.editingCategory.set(cat);
      this.categoryForm = {
        name: cat.name,
        description: cat.description || '',
        groupId: cat.groupId,
      };
    } else {
      this.editingCategory.set(null);
      const selG = this.selectedGroup();
      this.categoryForm = {
        name: '',
        description: '',
        groupId: selG ? selG.id : (this.groups().length > 0 ? this.groups()[0].id : null),
      };
    }
    this.isCategoryModalOpen.set(true);
  }

  closeCategoryModal() {
    this.isCategoryModalOpen.set(false);
    this.editingCategory.set(null);
  }

  saveCategory() {
    if (!this.categoryForm.name || !this.categoryForm.groupId) return;
    this.isSaving.set(true);
    const payload = {
      name: this.categoryForm.name,
      description: this.categoryForm.description,
      groupId: Number(this.categoryForm.groupId),
    };

    const current = this.editingCategory();
    if (current) {
      this.apiService.put(`/categories/${current.id}`, payload).subscribe({
        next: () => {
          this.toastService.success('Categoría actualizada.');
          this.isSaving.set(false);
          this.closeCategoryModal();
          this.loadAll();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al actualizar categoría.');
          this.isSaving.set(false);
        },
      });
    } else {
      this.apiService.post('/categories', payload).subscribe({
        next: () => {
          this.toastService.success('Categoría registrada.');
          this.isSaving.set(false);
          this.closeCategoryModal();
          this.loadAll();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al crear categoría.');
          this.isSaving.set(false);
        },
      });
    }
  }

  confirmDeleteCategory(c: Category) {
    this.deleteType = 'category';
    this.deleteItemId = c.id;
    this.deleteItemName = c.name;
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
  }

  executeDelete() {
    this.isSaving.set(true);
    const endpoint = this.deleteType === 'group' ? `/groups/${this.deleteItemId}` : `/categories/${this.deleteItemId}`;

    this.apiService.delete(endpoint).subscribe({
      next: () => {
        this.toastService.success(
          `${this.deleteType === 'group' ? 'Grupo' : 'Categoría'} eliminado exitosamente.`,
        );
        this.isSaving.set(false);
        this.closeDeleteModal();
        if (this.deleteType === 'group' && this.selectedGroup()?.id === this.deleteItemId) {
          this.selectedGroup.set(null);
        }
        this.loadAll();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'No se pudo eliminar el registro.');
        this.isSaving.set(false);
      },
    });
  }
}
