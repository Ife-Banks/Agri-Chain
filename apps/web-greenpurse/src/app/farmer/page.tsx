'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Avatar } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { useAuthStore } from '../../store/auth';
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

const stats = [
  {
    label: 'Total Revenue',
    value: '₦1,245,800',
    change: '+12.5%',
    trend: 'up',
    icon: TrendingUp,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    label: 'Orders This Month',
    value: '156',
    change: '+8.2%',
    trend: 'up',
    icon: ShoppingBag,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Active Products',
    value: '24',
    change: '+2',
    trend: 'up',
    icon: Package,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    label: 'Pending Orders',
    value: '8',
    change: '-3',
    trend: 'down',
    icon: Clock,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
];

const recentOrders = [
  {
    id: 'ORD-7821',
    customer: 'Amina Bello',
    items: 3,
    total: 12500,
    status: 'pending',
  },
  {
    id: 'ORD-7820',
    customer: 'Tunde Okafor',
    items: 5,
    total: 28750,
    status: 'processing',
  },
  {
    id: 'ORD-7819',
    customer: 'Grace Mensah',
    items: 2,
    total: 8400,
    status: 'delivered',
  },
  {
    id: 'ORD-7818',
    customer: 'Ibrahim Yusuf',
    items: 4,
    total: 19200,
    status: 'delivered',
  },
];

const lowStockProducts = [
  { id: 'p1', name: 'Fresh Organic Tomatoes', stock: 8, threshold: 20, color: 'bg-red-500' },
  { id: 'p2', name: 'Yellow Maize', stock: 15, threshold: 50, color: 'bg-yellow-500' },
  { id: 'p5', name: 'Organic Spinach Bundle', stock: 5, threshold: 15, color: 'bg-orange-500' },
];

const topProducts = [
  { id: 'p1', name: 'Fresh Organic Tomatoes', sold: 145, revenue: 652500 },
  { id: 'p4', name: 'Dry Groundnut', sold: 89, revenue: 578500 },
  { id: 'p3', name: 'Fresh Cassava Tubers', sold: 67, revenue: 120600 },
];

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
};

function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  bgColor,
  iconColor,
}: (typeof stats)[0]) {
  return (
    <Card className="flex h-full items-center gap-4 border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        <div
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {trend === 'up' ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          <span>{change}</span>
          <span className="opacity-70">vs last month</span>
        </div>
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
    </Card>
  );
}

function OrderRow({ order }: { order: (typeof recentOrders)[0] }) {
  const config = statusConfig[order.status];
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar size={40} className="bg-green-100 text-green-700">
          {order.customer.charAt(0)}
        </Avatar>
        <div>
          <p className="font-semibold text-gray-900">{order.customer}</p>
          <p className="text-xs text-gray-500">
            {order.id} · {order.items} items
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
        <span
          className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${config.bg} ${config.text}`}
        >
          {config.label}
        </span>
      </div>
    </div>
  );
}

function StockRow({ product }: { product: (typeof lowStockProducts)[0] }) {
  const percentage = Math.round((product.stock / product.threshold) * 100);
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-3">
      <div className="min-w-0 flex-1 pr-3">
        <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full transition-all ${product.color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-gray-900">{product.stock}</p>
        <p className="text-xs text-gray-500">of {product.threshold}</p>
      </div>
    </div>
  );
}

export default function FarmerDashboard() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.username?.split(' ')[0] || 'Farmer';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.section variants={item}>
        <div className="mb-2">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/farmer" className="hover:text-green-600">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Overview</span>
          </nav>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your farm today.
        </p>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={item}>
          <Card className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                <p className="text-sm text-gray-500">Latest orders from your customers</p>
              </div>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-700"
              >
                <Link href="/farmer/orders">View all</Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={item} className="flex flex-col gap-6">
          <Card className="border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">Low Stock Alert</h2>
              <p className="text-sm text-gray-500">Items that need restocking</p>
            </div>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <StockRow key={product.id} product={product} />
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-4 w-full rounded-xl border-green-200 text-green-700 hover:bg-green-50"
            >
              <Link href="/farmer/products">Manage Inventory</Link>
            </Button>
          </Card>

          <Card className="border border-green-200 bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <Plus className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-bold text-black">Add New Product</h2>
            <p className="mt-1 text-sm text-green-900">
              List your fresh produce for buyers to discover.
            </p>
            <Button
              asChild
              className="mt-4 w-full rounded-xl bg-white text-green-700 hover:bg-green-50"
            >
              <Link href="/farmer/products/new">Add Product</Link>
            </Button>
          </Card>
        </motion.div>
      </div>

      <motion.section variants={item}>
        <Card className="border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Top Performing Products
              </h2>
              <p className="text-sm text-gray-500">Your best sellers this month</p>
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="rounded-full text-green-600 hover:bg-green-50 hover:text-green-700"
            >
              <Link href="/farmer/products">View all products</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>
                  <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Units Sold
                  </th>
                  <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topProducts.map((product, index) => (
                  <tr
                    key={product.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-sm font-bold text-green-700">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-sm font-medium text-gray-900">
                      {product.sold}
                    </td>
                    <td className="py-3 text-right font-bold text-green-700">
                      {formatCurrency(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.section>
    </motion.div>
  );
}