import { create } from 'zustand';
import { IUser, ICompany, INotification } from '@/types';

interface AuthState {
  user: IUser | ICompany | null;
  userType: 'user' | 'company' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  tokenExpiry: number | null;
  setUser: (user: IUser | ICompany | null, type: 'user' | 'company' | null, expiry?: number) => void;
  setAuthLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
}

interface ModalState {
  isOpen: boolean;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  openModal: (type: string, message: string) => void;
  closeModal: () => void;
}

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userType: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  tokenExpiry: null,
  setUser: (user, type, expiry) =>
    set({
      user,
      userType: type,
      isAuthenticated: !!user,
      error: null,
      tokenExpiry: expiry || null,
    }),
  setAuthLoading: (loading) => set({ isLoading: loading }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setError: (error) => set({ error }),
  logout: () =>
    set({
      user: null,
      userType: null,
      isAuthenticated: false,
      error: null,
      tokenExpiry: null,
    }),
}));

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: !notification.read ? state.unreadCount + 1 : state.unreadCount,
    })),
  removeNotification: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === id);
      return {
        notifications: state.notifications.filter((n) => n._id !== id),
        unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
      };
    }),
  markAsRead: (id) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === id);
      if (notification) {
        notification.read = true;
        return {
          notifications: [...state.notifications],
          unreadCount: Math.max(0, state.unreadCount - 1),
        };
      }
      return state;
    }),
  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),
}));

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: 'info',
  message: '',
  openModal: (type: any, message: string) =>
    set({
      isOpen: true,
      type,
      message,
    }),
  closeModal: () =>
    set({
      isOpen: false,
    }),
}));

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
