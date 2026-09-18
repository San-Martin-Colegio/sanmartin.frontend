import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../../icons/icons.module';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconsModule],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto bg-slate-950/45 backdrop-blur-md transition-opacity"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative w-full bg-white rounded-3xl shadow-2xl shadow-slate-950/25 border border-white/70 overflow-hidden transform transition-all my-8 max-h-[90vh] flex flex-col"
        [ngClass]="maxWidth"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/70">
          <h3 class="text-lg font-bold tracking-tight text-primary">{{ title }}</h3>
          <button
            type="button"
            (click)="onClose()"
            class="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 inline-flex items-center justify-center transition-colors"
          >
            <lucide-icon name="x" [size]="20"></lucide-icon>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="px-6 py-5 overflow-y-auto flex-1">
          <ng-content select="[body]"></ng-content>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <ng-content select="[footer]"></ng-content>
        </div>
      </div>
    </div>
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() maxWidth = 'max-w-lg';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    this.onClose();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.onClose();
    }
  }
}
