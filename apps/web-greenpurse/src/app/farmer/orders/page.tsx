'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Avatar } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { Pagination } from '../../../components/ui/pagination';
import { Loader2 } from 'lucide-react';
import { useOrders } from '../../../hooks/useOrders';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  customerAvatar?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  address: string;
  phone: string;
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-7825',
    customer: 'Amina Bello',
    items: [
      { id: '1', name: 'Fresh Organic Tomatoes', quantity: 3, price: 4500 },
      { id: '2', name: 'Yellow Maize', quantity: 2, price: 2800 },
    ],
    subtotal: 19100,
    deliveryFee: 1500,
    total: 20600,
    status: 'pending',
    address: '15 Adeola Odeku Street, Victoria Island, Lagos',
    phone: '08012345678',
    createdAt: '2026-06-18T11:30:00Z',
  },
  {
    id: 'ORD-7824',
    customer: 'Tunde Okafor',
    items: [
      { id: '3', name: 'Fresh Cassava Tubers', quantity: 5, price: 1800 },
      { id: '4', name: 'Dry Groundnut', quantity: 2, price: 6500 },
      { id: '5', name: 'Organic Spinach Bundle', quantity: 1, price: 2200 },
    ],
    subtotal: 21200,
    deliveryFee: 2000,
    total: 23200,
    status: 'processing',
    address: '42 Bode Thomas Street, Surulere, Lagos',
    phone: '08198765432',
    createdAt: '2026-06-18T09:15:00Z',
  },
  {
    id: 'ORD-7823',
    customer: 'Grace Mensah',
    items: [
      { id: '6', name: 'Premium Palm Oil', quantity: 4, price: 5500 },
    ],
    subtotal: 22000,
    deliveryFee: 1500,
    total: 23500,
    status: 'shipped',
    address: '8 Wuse Zone 5, Wuse, Abuja',
    phone: '09087654321',
    createdAt: '2026-06-17T16:45:00Z',
  },
  {
    id: 'ORD-7822',
    customer: 'Ibrahim Yusuf',
    items: [
      { id: '7', name: 'Fresh Organic Tomatoes', quantity: 10, price: 4500 },
      { id: '8', name: 'Yellow Maize', quantity: 5, price: 2800 },
    ],
    subtotal: 59000,
    deliveryFee: 2500,
    total: 61500,
    status: 'delivered',
    address: '23 Maitama District, Maitama, Abuja',
    phone: '08055555555',
    createdAt: '2026-06-16T14:20:00Z',
  },
  {
    id: 'ORD-7821',
    customer: 'Chidinma Eze',
    items: [
      { id: '9', name: 'Dry Groundnut', quantity: 3, price: 6500 },
    ],
    subtotal: 19500,
    deliveryFee: 1500,
    total: 21000,
    status: 'cancelled',
    address: '5 Kano Street, Kaduna South, Kaduna',
    phone: '08133333333',
    createdAt: '2026-06-15T10:00:00Z',
  },
];

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100 border-amber-200' },
  processing: { label: 'Processing', color: 'text-blue-700', bgColor: 'bg-blue-100 border-blue-200' },
  shipped: { label: 'Shipped', color: 'text-purple-700', bgColor: 'bg-purple-100 border-purple-200' },
  delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100 border-green-200' },
  cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100 border-red-200' },
};

const statusOrder: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[order.status];

  const canUpdateTo = (newStatus: OrderStatus): boolean => {
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(newStatus);
    return newIndex >= 0 && newIndex <= currentIndex + 1;
  };

  const nextStatus = (): OrderStatus | null => {
    const currentIndex = statusOrder.indexOf(order.status);
    if (currentIndex < statusOrder.length - 1) {
      return statusOrder[currentIndex + 1];
    }
    return null;
  };

  return (
    <Card className="overflow-hidden border-[rgba(203,213,224,0.6)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all hover:shadow-[0_12px_32px_rgba(15,74,40,0.1)]">
      <div
        className="cursor-pointer p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar size={48} className="bg-gradient-to-br from-green-100 to-emerald-100 text-green-700">
              {order.customer.charAt(0)}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{order.customer}</h3>
                <Badge className={`${config.bgColor} ${config.color} text-xs`}>
                  {config.label}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500">{order.id}</p>
              <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-green-700">{formatCurrency(order.total)}</p>
            <p className="text-xs text-gray-500">
              {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
            </p>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[rgba(203,213,224,0.4)] p-5 bg-gray-50/50">
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Order Items</h4>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className="font-medium text-gray-900">{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span className="text-green-700">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Delivery Address</h4>
            <p className="text-sm text-gray-600">{order.address}</p>
            <p className="text-sm text-gray-600">{order.phone}</p>
          </div>

          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="flex flex-wrap gap-2">
              {nextStatus() && canUpdateTo(nextStatus()!) && (
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-green-600 to-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(order.id, nextStatus()!);
                  }}
                >
                  Mark as {statusConfig[nextStatus()!].label}
                </Button>
              )}
              {order.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-red-200 text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(order.id, 'cancelled');
                  }}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [useApi, setUseApi] = useState(false);

  const { orders: apiOrders, total, totalPages, isLoading } = useOrders({
    page,
    limit: pageSize,
    status: filterStatus === 'all' ? undefined : filterStatus,
  });

  useEffect(() => {
    if (useApi && apiOrders.length > 0) {
      setOrders(apiOrders);
    }
  }, [apiOrders, useApi]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const updateStatus = (orderId: string, newStatus: OrderStatus) => {
    if (useApi) {
      return;
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders = orders
    .filter((o) => {
      if (filterStatus !== 'all') return o.status === filterStatus;
      return true;
    })
    .filter((o) =>
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const stats = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item}>
        <div className="mb-6">
          <Badge className="bg-green-100 text-green-700 border-green-200">Orders</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
            Order Management
          </h1>
          <p className="mt-1 text-gray-500">
            Track and manage incoming orders from your customers
          </p>
        </div>
      </motion.section>

      <motion.section variants={item}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(['all', 'pending', 'processing', 'shipped', 'delivered'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-xl border p-4 text-left transition-all hover:-translate-y-1 ${
                filterStatus === status
                  ? 'border-green-300 bg-green-50 shadow-[0_8px_24px_rgba(15,74,40,0.12)]'
                  : 'border-[rgba(203,213,224,0.6)] bg-white shadow-sm hover:border-green-200 hover:shadow-md'
              }`}
            >
              <p className="text-sm font-medium text-gray-600 capitalize">
                {status === 'all' ? 'All Orders' : status}
              </p>
              <p className={`mt-1 text-2xl font-bold ${
                filterStatus === status ? 'text-green-700' : 'text-gray-900'
              }`}>
                {stats[status]}
              </p>
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section variants={item}>
        <Card className="border-[rgba(203,213,224,0.6)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <div className="border-b border-[rgba(203,213,224,0.4)] p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders by ID or customer..."
                  className="w-full rounded-xl border border-[rgba(203,213,224,0.6)] bg-white/80 py-2.5 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-green-400 focus:bg-white focus:shadow-[0_8px_24px_rgba(15,74,40,0.12)]"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUseApi(!useApi)}
                  className={`text-xs px-3 py-1.5 rounded-lg border ${
                    useApi
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}
                >
                  {useApi ? 'Using API' : 'Using Mock Data'}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-3xl">📦</div>
              <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery ? 'Try adjusting your search' : 'Orders will appear here when customers place them'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 p-4">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />
                ))}
              </div>
              {useApi && (
                <div className="border-t border-[rgba(203,213,224,0.4)] p-4">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    total={total}
                    pageSize={pageSize}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                  />
                </div>
              )}
            </>
          )}
        </Card>
      </motion.section>
    </motion.div>
  );
}