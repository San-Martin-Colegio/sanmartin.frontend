export interface User {
  id: number;
  username: string;
  fullName: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Group {
  id: number;
  name: string;
  icon?: string;
  description?: string;
  order?: number;
  categories?: Category[];
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  groupId: number;
  group?: Group;
  createdAt?: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  categoryId: number;
  quantity: number;
  status: 'Bueno' | 'Regular' | 'Malo' | string;
  location?: string;
  notes?: string;
  category?: Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface InventoryFilter {
  q?: string;
  groupId?: string;
  categoryId?: string;
  status?: string;
}

export interface InventoryStats {
  total: number;
  byStatus: {
    Bueno: number;
    Regular: number;
    Malo: number;
  };
  byGroup: Record<number, number>;
  recent: InventoryItem[];
  attention: InventoryItem[];
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  address?: string;
  specialty?: string;
  status: 'Activo' | 'Inactivo' | string;
  createdAt?: string;
}

export interface Schedule {
  id: number;
  teacherId: number;
  day: string;
  block: number;
  startTime?: string;
  endTime?: string;
  subject?: string;
  gradeSection?: string;
  classroom?: string;
  teacher?: Teacher;
  createdAt?: string;
}

export interface ScheduleBlockInfo {
  block: number;
  startTime: string;
  endTime: string;
}

export interface School {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  principal?: string;
  mission?: string;
  vision?: string;
  values?: string;
}
