import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Computer, Group } from '../../core/models/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { IconsModule } from '../../shared/icons/icons.module';

@Component({
  selector: 'app-computers', standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, IconsModule],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h2 class="text-2xl font-bold text-slate-900">Cómputo</h2><p class="text-sm text-slate-500">Registro individual de computadoras por área / zona.</p></div>
        <button (click)="openModal()" class="btn-primary"><lucide-icon name="plus" [size]="16"></lucide-icon> Agregar computadora</button>
      </div>

      <div class="card-smp p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input [(ngModel)]="search" (ngModelChange)="load()" class="input-smp" placeholder="Buscar por ID, código u observación" />
        <select [(ngModel)]="selectedStatus" (ngModelChange)="load()" class="select-smp"><option value="">Todos los estados</option><option value="Bueno">Bueno</option><option value="Regular">Regular</option><option value="Malo">Malo</option><option value="Descarte">Descarte</option></select>
      </div>

      <div class="card-smp p-0 overflow-hidden">
        <div *ngIf="isLoading()" class="py-16 text-center text-slate-400">Cargando computadoras...</div>
        <div *ngIf="!isLoading() && !computers().length" class="py-16 text-center text-slate-400">No hay computadoras registradas.</div>
        <div *ngIf="!isLoading() && computers().length" class="overflow-x-auto">
          <table class="w-full min-w-[760px] table-fixed text-left text-sm">
            <colgroup><col class="w-16"><col class="w-32"><col class="w-36"><col class="w-44"><col><col class="w-24"></colgroup>
            <thead class="bg-slate-50 text-xs text-slate-600"><tr><th class="p-3">ID</th><th class="p-3">Código</th><th class="p-3">Estado</th><th class="p-3">Área / Zona</th><th class="p-3">Observación</th><th class="p-3 text-right">Acciones</th></tr></thead>
            <tbody class="divide-y divide-slate-100"><tr *ngFor="let computer of computers()" class="hover:bg-slate-50"><td class="p-3 font-mono">{{ computer.id }}</td><td class="p-3 font-bold whitespace-nowrap">{{ computer.code }}</td><td class="p-3"><span class="px-2 py-1 rounded-full text-xs font-bold" [ngClass]="statusClass(computer.status)">{{ computer.status }}</span></td><td class="p-3 whitespace-nowrap text-slate-700">{{ computer.area?.name }}</td><td class="p-3"><button *ngIf="computer.observation" (click)="openObservation(computer)" class="block max-w-full truncate text-left text-slate-500 hover:text-primary hover:underline" title="Ver observación completa">{{ computer.observation }}</button><span *ngIf="!computer.observation" class="text-slate-400">—</span></td><td class="p-3 text-right"><button (click)="openModal(computer)" class="text-primary font-semibold hover:underline">Editar</button></td></tr></tbody>
          </table>
        </div>
      </div>

      <app-modal [isOpen]="modalOpen()" [title]="editing() ? 'Editar computadora' : 'Agregar computadora'" maxWidth="max-w-md" (close)="closeModal()"><div body class="space-y-4"><div><label class="block text-xs font-semibold mb-1">Código *</label><input [(ngModel)]="form.code" class="input-smp" placeholder="Ej: PC-001" /></div><div><label class="block text-xs font-semibold mb-1">Área / Zona *</label><select [ngModel]="form.areaId" (ngModelChange)="setArea($event)" class="select-smp"><option [ngValue]="null" disabled>Selecciona un área</option><option *ngFor="let area of areas()" [ngValue]="area.id">{{ area.name }}</option></select></div><div><label class="block text-xs font-semibold mb-1">Estado *</label><select [(ngModel)]="form.status" class="select-smp"><option value="Bueno">Bueno</option><option value="Regular">Regular</option><option value="Malo">Malo</option><option value="Descarte">Descarte</option></select></div><div><label class="block text-xs font-semibold mb-1">Observación</label><textarea [(ngModel)]="form.observation" rows="2" class="input-smp resize-y" placeholder="Detalle breve o incidencia"></textarea></div></div><div footer><button class="btn-outline" (click)="closeModal()">Cancelar</button><button class="btn-primary" [disabled]="saving() || !form.code || form.areaId === null" (click)="save()">{{ saving() ? 'Guardando...' : 'Guardar' }}</button></div></app-modal>
      <app-modal [isOpen]="observationModalOpen()" [title]="'Observación · ' + selectedObservation()?.code" maxWidth="max-w-lg" (close)="observationModalOpen.set(false)"><div body><p class="text-sm leading-6 whitespace-pre-wrap text-slate-700">{{ selectedObservation()?.observation }}</p></div><div footer><button class="btn-primary" (click)="observationModalOpen.set(false)">Cerrar</button></div></app-modal>
    </div>`,
})
export class ComputersComponent implements OnInit {
  computers = signal<Computer[]>([]); areas = signal<Group[]>([]); isLoading = signal(true); saving = signal(false); modalOpen = signal(false); observationModalOpen = signal(false); editing = signal<Computer | null>(null); selectedObservation = signal<Computer | null>(null); search = ''; selectedStatus = ''; form = { code: '', areaId: null as number | null, status: 'Bueno', observation: '' };
  constructor(private api: ApiService, private toast: ToastService) {}
  ngOnInit() { this.api.get<Group[]>('/groups').subscribe({ next: areas => this.areas.set(areas) }); this.load(); }
  load() { this.isLoading.set(true); this.api.get<Computer[]>('/computers', { q: this.search || undefined, status: this.selectedStatus || undefined }).subscribe({ next: rows => { this.computers.set(rows); this.isLoading.set(false); }, error: () => { this.toast.error('No se pudieron cargar las computadoras.'); this.isLoading.set(false); } }); }
  openModal(computer?: Computer) { this.editing.set(computer || null); this.form = computer ? { code: computer.code, areaId: Number(computer.areaId), status: computer.status, observation: computer.observation || '' } : { code: '', areaId: this.areas()[0]?.id || null, status: 'Bueno', observation: '' }; this.modalOpen.set(true); }
  closeModal() { this.modalOpen.set(false); this.editing.set(null); }
  openObservation(computer: Computer) { this.selectedObservation.set(computer); this.observationModalOpen.set(true); }
  setArea(areaId: number | string | null) { this.form.areaId = areaId === null ? null : Number(areaId); }
  save() { if (!this.form.code || this.form.areaId === null) return; this.saving.set(true); const current = this.editing(); const payload = { ...this.form, areaId: Number(this.form.areaId), code: this.form.code.trim() }; const request = current ? this.api.put(`/computers/${current.id}`, payload) : this.api.post('/computers', payload); request.subscribe({ next: () => { this.toast.success('Computadora guardada correctamente.'); this.saving.set(false); this.closeModal(); this.load(); }, error: e => { this.toast.error(e?.error?.message || 'No se pudo guardar la computadora.'); this.saving.set(false); } }); }
  statusClass(status: string) { if (status === 'Bueno') return 'bg-emerald-100 text-emerald-800'; if (status === 'Malo' || status === 'Descarte') return 'bg-rose-100 text-rose-800'; return 'bg-amber-100 text-amber-800'; }
}
