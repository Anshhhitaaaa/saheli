import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface AppNotification {
  id: string;
  category: 'cycle' | 'logging' | 'insights' | 'assistant' | 'pregnancy' | 'community' | 'care' | 'account';
  title: string;
  message: string;
  discreetMessage: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationCategories {
  cycle: boolean;
  logging: boolean;
  insights: boolean;
  assistant: boolean;
  pregnancy: boolean;
  community: boolean;
  care: boolean;
  account: boolean;
}

export interface NotificationSettings {
  discreetMode: boolean;
  categories: NotificationCategories;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  updateSettings: (discreetMode: boolean, categories: NotificationCategories) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const defaultCategories: NotificationCategories = {
  cycle: true,
  logging: true,
  insights: true,
  assistant: true,
  pregnancy: true,
  community: false,
  care: true,
  account: true,
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    discreetMode: true,
    categories: defaultCategories,
  });
  const [loading, setLoading] = useState<boolean>(false);

  const fetchNotificationData = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const [notifRes, settingsRes] = await Promise.all([
        api.notifications.get(user.email).catch(() => ({ notifications: [] })),
        api.notifications.getSettings(user.email).catch(() => ({ settings: null })),
      ]);

      if (notifRes.notifications) {
        setNotifications(notifRes.notifications);
      }
      if (settingsRes.settings) {
        setSettings({
          discreetMode: settingsRes.settings.discreetMode ?? true,
          categories: { ...defaultCategories, ...(settingsRes.settings.categories || {}) },
        });
      }
    } catch {
      // Fallback grace
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationData();
  }, [user?.email]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (user?.email) {
      await api.notifications.markRead(user.email, id).catch(() => {});
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (user?.email) {
      await api.notifications.markRead(user.email, undefined, true).catch(() => {});
    }
  };

  const updateSettings = async (discreetMode: boolean, categories: NotificationCategories) => {
    setSettings({ discreetMode, categories });
    if (user?.email) {
      await api.notifications.updateSettings(user.email, discreetMode, categories).catch(() => {});
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        loading,
        markAsRead,
        markAllAsRead,
        updateSettings,
        refreshNotifications: fetchNotificationData,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
