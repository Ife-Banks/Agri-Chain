'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  ChevronRight,
  Check,
  X,
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Trash2,
  Filter,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../store/auth';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

type NotificationType = 'order' | 'payment' | 'alert' | 'info' | 'promo';
type NotificationStatus = 'unread' | 'read';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  status: NotificationStatus;
  readAt?: string;
}

const mockNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'New Order Received',
    description: 'Amina Bello placed an order for ₦12,500. Order ID: ORD-7821',
    time: '2026-06-18T10:30:00',
    status: 'unread',
  },
  {
    id: 'n2',
    type: 'payment',
    title: 'Payment Confirmed',
    description: 'Payment of ₦28,750 received for order ORD-7820',
    time: '2026-06-18T09:15:00',
    status: 'unread',
  },
  {
    id: 'n3',
    type: 'alert',
    title: 'Low Stock Alert',
    description: 'Fresh Organic Tomatoes is running low (8 units remaining)',
    time: '2026-06-17T16:00:00',
    status: 'read',
    readAt: '2026-06-17T16:30:00',
  },
  {
    id: 'n4',
    type: 'info',
    title: 'Order Shipped',
    description: 'Order ORD-7819 has been shipped and is on the way',
    time: '2026-06-17T14:00:00',
    status: 'read',
    readAt: '2026-06-17T15:20:00',
  },
  {
    id: 'n5',
    type: 'promo',
    title: 'Flash Sale Coming!',
    description: 'Get ready for our weekend flash sale. Up to 30% off on vegetables.',
    time: '2026-06-16T12:00:00',
    status: 'read',
    readAt: '2026-06-16T13:00:00',
  },
  {
    id: 'n6',
    type: 'order',
    title: 'Order Delivered',
    description: 'Order ORD-7818 has been delivered successfully',
    time: '2026-06-15T18:00:00',
    status: 'read',
    readAt: '2026-06-15T19:00:00',
  },
];

const typeConfig: Record<NotificationType, { bg: string; color: string; icon: React.ReactNode }> = {
  order: { bg: 'bg-blue-100', color: 'text-blue-600', icon: <Package className="h-5 w-5" /> },
  payment: { bg: 'bg-green-100', color: 'text-green-600', icon: <DollarSign className="h-5 w-5" /> },
  alert: { bg: 'bg-red-100', color: 'text-red-600', icon: <AlertTriangle className="h-5 w-5" /> },
  info: { bg: 'bg-purple-100', color: 'text-purple-600', icon: <Info className="h-5 w-5" /> },
  promo: { bg: 'bg-amber-100', color: 'text-amber-600', icon: <Bell className="h-5 w-5" /> },
};

function formatTime(date: string): string {
  const now = new Date();
  const notifDate = new Date(date);
  const diff = now.getTime() - notifDate.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return notifDate.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
}

export default function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');

  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread' && n.status !== 'unread') return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: 'read' as NotificationStatus, readAt: new Date().toISOString() }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAllRead = () => {
    setNotifications((prev) => prev.filter((n) => n.status === 'unread'));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-8">
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
        <motion.section variants={item}>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/farmer" className="hover:text-green-600">Dashboard</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Notifications</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-1 text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <Check className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </motion.section>

        <motion.section variants={item}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notifications..."
                className="pl-10 border-gray-200 focus:border-green-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'unread')}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-green-400 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
              </select>
              {notifications.some((n) => n.status === 'read') && (
                <Button variant="ghost" size="sm" onClick={deleteAllRead} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Read
                </Button>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section variants={item} className="space-y-2">
          {filteredNotifications.length === 0 ? (
            <Card className="border border-gray-200 bg-white p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'unread' ? 'No unread notifications' : 'You\'re all caught up!'}
              </p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => {
              const config = typeConfig[notification.type];
              return (
                <div
                  key={notification.id}
                  className={`group relative flex items-start gap-4 rounded-xl border p-4 transition-all ${
                    notification.status === 'unread'
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900">{notification.title}</p>
                        <p className="mt-1 text-sm text-gray-500">{notification.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {notification.status === 'unread' && (
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                        )}
                        <span className="text-xs text-gray-400">{formatTime(notification.time)}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {notification.status === 'unread' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs h-7"
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Mark as Read
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-xs h-7 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </motion.section>
      </motion.div>
    </div>
  );
}