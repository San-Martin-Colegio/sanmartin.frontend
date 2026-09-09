import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3500) {
    const id = ++this.counter;
    const newToast: Toast = { id, message, type };
    this.toasts.update((current) => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(message: string, duration = 3500) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4500) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3500) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000) {
    this.show(message, 'warning', duration);
  }

  dismiss(id: number) {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
