import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { IconsModule } from '../../icons/icons.module';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <div
        *ngFor="let t of toastService.toasts()"
        class="pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0"
        [ngClass]="{
          'bg-emerald-50 border-emerald-200 text-emerald-800': t.type === 'success',
          'bg-rose-50 border-rose-200 text-rose-800': t.type === 'error',
          'bg-amber-50 border-amber-200 text-amber-800': t.type === 'warning',
          'bg-blue-50 border-blue-200 text-blue-800': t.type === 'info'
        }"
      >
        <div class="flex items-center gap-3">
          <span class="flex items-center justify-center">
            <ng-container [ngSwitch]="t.type">
              <lucide-icon *ngSwitchCase="'success'" name="check-circle-2" [size]="20" class="text-emerald-600"></lucide-icon>
              <lucide-icon *ngSwitchCase="'error'" name="x-circle" [size]="20" class="text-rose-600"></lucide-icon>
              <lucide-icon *ngSwitchCase="'warning'" name="alert-triangle" [size]="20" class="text-amber-600"></lucide-icon>
              <lucide-icon *ngSwitchDefault name="info" [size]="20" class="text-blue-600"></lucide-icon>
            </ng-container>
          </span>
          <p class="font-medium leading-tight">{{ t.message }}</p>
        </div>
        <button
          type="button"
          (click)="toastService.dismiss(t.id)"
          class="ml-3 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors flex items-center justify-center"
        >
          <lucide-icon name="x" [size]="16"></lucide-icon>
        </button>
      </div>
    </div>
  `,
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
