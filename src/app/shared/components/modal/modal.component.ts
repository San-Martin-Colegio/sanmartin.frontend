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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto bg-slate-900/50 backdrop-blur-sm transition-opacity"
      (click)="onBackdropClick($event)"
    >
      <div
        class="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all my-8 max-h-[90vh] flex flex-col"
        [ngClass]="maxWidth"
        (click)="$event.stopPropagation()"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
          <h3 class="text-lg font-bold text-primary">{{ title }}</h3>
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
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
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
