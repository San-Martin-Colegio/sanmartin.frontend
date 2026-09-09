import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { InventoryItem, Group, Category } from '../../core/models/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconsModule],
  template: `
    <div class="space-y-6">
      <!-- Header with Action -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold tracking-tight text-slate-900">Control de Inventario</h2>
          <p class="text-sm text-slate-500 mt-0.5">Gestión de activos, equipos y materiales de la institución.</p>
        </div>
        <div>
          <button (click)="openCreateModal()" class="btn-primary flex items-center gap-2">
            <lucide-icon name="plus" [size]="16"></lucide-icon>
            <span>Nuevo Ítem</span>
          </button>
        </div>
      </div>

      <!-- Filter Controls Card -->
      <div class="card-smp p-5 space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Text Search -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Buscar</label>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="applyFilters()"
              placeholder="Nombre, ubicación u notas..."
              class="input-smp"
            />
          </div>

          <!-- Group Filter -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Grupo</label>
            <select
              [(ngModel)]="selectedGroupId"
              (ngModelChange)="onGroupFilterChange()"
              class="select-smp"
            >
              <option value="">Todos los grupos</option>
              <option *ngFor="let g of groups()" [value]="g.id">{{ g.name }}</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Categoría</label>
            <select
              [(ngModel)]="selectedCategoryId"
              (ngModelChange)="applyFilters()"
              class="select-smp"
            >
              <option value="">Todas las categorías</option>
              <option *ngFor="let c of filteredCategories()" [value]="c.id">{{ c.name }}</option>
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Estado</label>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="applyFilters()"
              class="select-smp"
            >
              <option value="">Todos los estados</option>
              <option value="Bueno">Bueno</option>
              <option value="Regular">Regular</option>
              <option value="Malo">Malo</option>
            </select>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 border-t text-xs text-slate-500">
          <span>Mostrando <strong>{{ items().length }}</strong> elementos</span>
          <button
            *ngIf="searchQuery || selectedGroupId || selectedCategoryId || selectedStatus"
            (click)="resetFilters()"
            class="text-primary hover:underline font-semibold"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="card-smp p-0 overflow-hidden">
        <div *ngIf="isLoading()" class="py-16 text-center text-slate-400">
          <svg class="animate-spin h-7 w-7 text-primary mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <p class="text-xs">Cargando inventario...</p>
        </div>

        <div *ngIf="!isLoading() && items().length === 0" class="py-16 text-center text-slate-400 flex flex-col items-center">
          <lucide-icon name="package" [size]="44" class="text-slate-300 mb-2"></lucide-icon>
          <p class="text-sm font-medium text-slate-600">No se encontraron ítems</p>
          <p class="text-xs text-slate-400 mt-0.5">Intenta ajustar los filtros de búsqueda o agrega un nuevo ítem.</p>
        </div>

        <div *ngIf="!isLoading() && items().length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm">
            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th class="py-3 px-4">Ítem</th>
                <th class="py-3 px-4">Categoría / Grupo</th>
                <th class="py-3 px-4">Cantidad</th>
                <th class="py-3 px-4">Estado</th>
                <th class="py-3 px-4">Ubicación</th>
                <th class="py-3 px-4">Observaciones</th>
                <th class="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let item of items()" class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 font-bold text-slate-900">{{ item.name }}</td>
                <td class="py-3 px-4">
                  <div class="flex flex-col">
                    <span class="font-medium text-slate-800">{{ item.category?.name || '-' }}</span>
                    <span class="text-[11px] text-slate-400">{{ item.category?.group?.name || '' }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-semibold text-slate-800">
                  <span class="inline-block px-2.5 py-0.5 rounded-lg bg-slate-100 font-mono text-xs">
                    {{ item.quantity }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-bold"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-800': item.status === 'Bueno',
                      'bg-amber-100 text-amber-800': item.status === 'Regular',
                      'bg-rose-100 text-rose-800': item.status === 'Malo'
                    }"
                  >
                    {{ item.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-600">{{ item.location || 'Sin ubicación' }}</td>
                <td class="py-3 px-4 text-slate-500 max-w-xs truncate">{{ item.notes || '-' }}</td>
                <td class="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                  <button
                    (click)="openEditModal(item)"
                    class="px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg transition-colors inline-flex items-center gap-1"
                  >
                    <lucide-icon name="pencil" [size]="13"></lucide-icon>
                    <span>Editar</span>
                  </button>
                  <button
                    (click)="confirmDelete(item)"
                    class="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1"
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

      <!-- Modal Create / Edit Item -->
      <app-modal
        [isOpen]="isModalOpen()"
        [title]="editingItem() ? 'Editar Ítem de Inventario' : 'Registrar Nuevo Ítem'"
        (close)="closeModal()"
      >
        <div body class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Nombre del Bien *</label>
            <input
              type="text"
              [(ngModel)]="formData.name"
              placeholder="Ej: Proyector Multimedia Epson"
              required
              class="input-smp"
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Categoría *</label>
              <select [(ngModel)]="formData.categoryId" class="select-smp" required>
                <option [ngValue]="null" disabled>Selecciona una categoría</option>
                <option *ngFor="let cat of categories()" [ngValue]="cat.id">
                  {{ cat.group?.name ? cat.group?.name + ' - ' : '' }}{{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Cantidad *</label>
              <input
                type="number"
                min="1"
                [(ngModel)]="formData.quantity"
                class="input-smp"
                required
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Estado de Conservación *</label>
              <select [(ngModel)]="formData.status" class="select-smp">
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Malo">Malo</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Ubicación</label>
              <input
                type="text"
                [(ngModel)]="formData.location"
                placeholder="Ej: Aula 102, Biblioteca, Laboratorio"
                class="input-smp"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Observaciones / Detalles</label>
            <textarea
              [(ngModel)]="formData.notes"
              rows="3"
              placeholder="Detalles técnicos, código de serie o estado..."
              class="input-smp"
            ></textarea>
          </div>
        </div>

        <div footer>
          <button type="button" (click)="closeModal()" class="btn-outline">Cancelar</button>
          <button
            type="button"
            (click)="saveItem()"
            [disabled]="isSaving() || !formData.name || !formData.categoryId || formData.quantity < 1"
            class="btn-primary"
          >
            <span *ngIf="!isSaving()">{{ editingItem() ? 'Guardar Cambios' : 'Registrar Ítem' }}</span>
            <span *ngIf="isSaving()">Guardando...</span>
          </button>
        </div>
      </app-modal>

      <!-- Delete Confirmation Modal -->
      <app-modal
        [isOpen]="isDeleteModalOpen()"
        title="Confirmar Eliminación"
        maxWidth="max-w-md"
        (close)="closeDeleteModal()"
      >
        <div body class="py-2 text-center sm:text-left">
          <p class="text-sm text-slate-700">
            ¿Estás seguro de que deseas eliminar el ítem
            <strong class="text-slate-900 font-bold">{{ deletingItem()?.name }}</strong>?
          </p>
          <p class="text-xs text-rose-500 mt-2 font-medium">Esta acción no se puede deshacer.</p>
        </div>

        <div footer>
          <button type="button" (click)="closeDeleteModal()" class="btn-outline">Cancelar</button>
          <button
            type="button"
            (click)="executeDelete()"
            [disabled]="isSaving()"
            class="btn-danger flex items-center gap-1.5"
          >
            <lucide-icon name="trash-2" [size]="14"></lucide-icon>
            <span>Eliminar Definitivamente</span>
          </button>
        </div>
      </app-modal>
    </div>
  `,
})
export class InventoryComponent implements OnInit {
  items = signal<InventoryItem[]>([]);
  groups = signal<Group[]>([]);
  categories = signal<Category[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);

  // Filters
  searchQuery = '';
  selectedGroupId = '';
  selectedCategoryId = '';
  selectedStatus = '';

  // Modals
  isModalOpen = signal(false);
  editingItem = signal<InventoryItem | null>(null);

  isDeleteModalOpen = signal(false);
  deletingItem = signal<InventoryItem | null>(null);

  formData = {
    name: '',
    categoryId: null as number | null,
    quantity: 1,
    status: 'Bueno',
    location: '',
    notes: '',
  };

  filteredCategories = computed(() => {
    if (!this.selectedGroupId) return this.categories();
    const gId = parseInt(this.selectedGroupId, 10);
    return this.categories().filter((c) => c.groupId === gId);
  });

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.loadCatalogues();
    this.route.queryParams.subscribe((params) => {
      if (params['groupId']) this.selectedGroupId = params['groupId'];
      if (params['status']) this.selectedStatus = params['status'];
      this.loadItems();
    });
  }

  loadCatalogues() {
    this.apiService.get<Group[]>('/groups').subscribe({
      next: (groups) => this.groups.set(groups),
    });
    this.apiService.get<Category[]>('/categories').subscribe({
      next: (categories) => this.categories.set(categories),
    });
  }

  loadItems() {
    this.isLoading.set(true);
    const filter: Record<string, any> = {};
    if (this.searchQuery) filter['q'] = this.searchQuery;
    if (this.selectedGroupId) filter['groupId'] = this.selectedGroupId;
    if (this.selectedCategoryId) filter['categoryId'] = this.selectedCategoryId;
    if (this.selectedStatus) filter['status'] = this.selectedStatus;

    this.apiService.get<InventoryItem[]>('/inventory', filter).subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Error al cargar inventario.');
        this.isLoading.set(false);
      },
    });
  }

  applyFilters() {
    this.loadItems();
  }

  onGroupFilterChange() {
    this.selectedCategoryId = '';
    this.applyFilters();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedGroupId = '';
    this.selectedCategoryId = '';
    this.selectedStatus = '';
    this.loadItems();
  }

  openCreateModal() {
    this.editingItem.set(null);
    this.formData = {
      name: '',
      categoryId: this.categories().length > 0 ? this.categories()[0].id : null,
      quantity: 1,
      status: 'Bueno',
      location: '',
      notes: '',
    };
    this.isModalOpen.set(true);
  }

  openEditModal(item: InventoryItem) {
    this.editingItem.set(item);
    this.formData = {
      name: item.name,
      categoryId: item.categoryId,
      quantity: item.quantity,
      status: item.status,
      location: item.location || '',
      notes: item.notes || '',
    };
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.editingItem.set(null);
  }

  saveItem() {
    if (!this.formData.name || !this.formData.categoryId) return;
    this.isSaving.set(true);

    const payload = {
      name: this.formData.name,
      categoryId: this.formData.categoryId,
      quantity: Number(this.formData.quantity),
      status: this.formData.status,
      location: this.formData.location || undefined,
      notes: this.formData.notes || undefined,
    };

    const current = this.editingItem();
    if (current) {
      this.apiService.put<InventoryItem>(`/inventory/${current.id}`, payload).subscribe({
        next: () => {
          this.toastService.success('Ítem actualizado exitosamente.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al actualizar ítem.');
          this.isSaving.set(false);
        },
      });
    } else {
      this.apiService.post<InventoryItem>('/inventory', payload).subscribe({
        next: () => {
          this.toastService.success('Ítem registrado exitosamente.');
          this.isSaving.set(false);
          this.closeModal();
          this.loadItems();
        },
        error: (err) => {
          this.toastService.error(err?.error?.message || 'Error al crear ítem.');
          this.isSaving.set(false);
        },
      });
    }
  }

  confirmDelete(item: InventoryItem) {
    this.deletingItem.set(item);
    this.isDeleteModalOpen.set(true);
  }

  closeDeleteModal() {
    this.isDeleteModalOpen.set(false);
    this.deletingItem.set(null);
  }

  executeDelete() {
    const item = this.deletingItem();
    if (!item) return;

    this.isSaving.set(true);
    this.apiService.delete(`/inventory/${item.id}`).subscribe({
      next: () => {
        this.toastService.success('Ítem eliminado correctamente.');
        this.isSaving.set(false);
        this.closeDeleteModal();
        this.loadItems();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Error al eliminar ítem.');
        this.isSaving.set(false);
      },
    });
  }
}
