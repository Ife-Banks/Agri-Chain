'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowUpRight,
  DollarSign,
  Users,
  ShoppingBag,
  Sparkles,
  PackageCheck,
  CreditCard,
  BellRing,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { adminApi } from '../lib/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { LoadingSpinner } from '../components/LoadingSpinner';

const categoryColors = ['#10b981', '#0ea5e9', '#6366f1', '#f59e0b', '#f43f5e'];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function StatCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur pt-6">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {change}
          </div>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300 ring-1 ring-inset ring-emerald-500/20">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard(),
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.analytics(),
  });

  const counts = dashboardData?.data?.counts;
  const recentOrders = dashboardData?.data?.recentOrders || [];
  const totalRevenue = dashboardData?.data?.totalRevenue || 0;

  const revenueData = (analyticsData?.data?.revenueByDay || []).map((d: any) => ({
    name: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    revenue: Number(d.revenue) || 0,
  }));

  const ordersByStatus = analyticsData?.data?.ordersByStatus || [];

  const ordersData = [
    { name: 'Mon', orders: 0 }, { name: 'Tue', orders: 0 }, { name: 'Wed', orders: 0 },
    { name: 'Thu', orders: 0 }, { name: 'Fri', orders: 0 }, { name: 'Sat', orders: 0 }, { name: 'Sun', orders: 0 },
  ];

  const categoryData = (analyticsData?.data?.topProducts || []).slice(0, 5).map((p: any, i: number) => ({
    name: p.title || 'Unknown',
    value: Number(p.unitsSold) || 0,
  }));

  const isLoading = dashboardLoading || analyticsLoading;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  const formatStatus = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: 'Pending',
      PROCESSING: 'Processing',
      SHIPPED: 'Shipped',
      DELIVERED: 'Delivered',
      CANCELLED: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  const getBadgeVariant = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'destructive'> = {
      DELIVERED: 'success',
      PROCESSING: 'info',
      SHIPPED: 'secondary',
      PENDING: 'warning',
      CANCELLED: 'destructive',
    };
    return map[status] || 'secondary';
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section
        variants={item}
        className="overflow-hidden rounded-[28px] border border-white/5 bg-[linear-gradient(135deg,rgba(20,184,166,0.12),rgba(14,165,233,0.08),rgba(255,255,255,0.03))] p-6 shadow-soft sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            <Badge variant="success" className="w-fit bg-emerald-500/10 text-emerald-300">
              Operations overview
            </Badge>
            <div className="space-y-3">
              <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Good morning, Admin. Your storefront is moving steadily and the catalog is healthy.
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                Review performance, respond to orders, and stay ahead of inventory shifts from the refreshed AI-SUCE control center.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="h-11 bg-white text-zinc-950 hover:bg-zinc-100 dark:bg-white dark:text-zinc-950">
                View reports
              </Button>
              <Button variant="outline" className="h-11 border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10">
                Create campaign
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Low stock SKUs', value: String(counts?.totalProducts || 0) },
                { label: 'Open tickets', value: String(counts?.pendingOrders || 0) },
                { label: 'Revenue target', value: formatCurrency(totalRevenue).replace('$', '') },
              ].map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">{entry.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{entry.value}</p>
                </div>
              ))}
            </div>
          </div>
          <Card className="border-white/10 bg-zinc-950/60 p-5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader className="p-0">
              <CardTitle className="text-lg">Today at a glance</CardTitle>
              <CardDescription className="text-zinc-400">Key activity across orders and customer operations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-0 pt-5">
              {[
                { title: 'New users', value: String(counts?.totalUsers || 0), delta: '+14%' },
                { title: 'Orders completed', value: String(counts?.totalOrders || 0), delta: '+9%' },
                { title: 'Average basket', value: totalRevenue > 0 && (counts?.totalOrders || 0) > 0 ? formatCurrency(totalRevenue / (counts?.totalOrders || 1)) : '$0.00', delta: '+3%' },
              ].map((entry) => (
                <div key={entry.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <div>
                    <p className="text-sm text-zinc-400">{entry.title}</p>
                    <p className="text-xl font-semibold">{entry.value}</p>
                  </div>
                  <Badge variant="success" className="bg-emerald-500/10 text-emerald-300">
                    {entry.delta}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} change="+12.4%" icon={DollarSign} />
        <StatCard label="Active Customers" value={String(counts?.totalUsers || 0)} change="+8.2%" icon={Users} />
        <StatCard label="Total Orders" value={String(counts?.totalOrders || 0)} change="+4.1%" icon={ShoppingBag} />
        <StatCard label="Conversion Rate" value="3.8%" change="+0.6%" icon={TrendingUp} />
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Revenue performance</CardTitle>
                  <CardDescription className="text-zinc-400">Monthly sales trend for the current cycle.</CardDescription>
                </div>
                <Badge variant="info" className="bg-sky-500/10 text-sky-300">
                  +12.4% vs last cycle
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.length > 0 ? revenueData : [{ name: 'No data', revenue: 0 }]}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{
                      background: 'rgba(9,9,11,0.92)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="revenue" radius={[10, 10, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <CardTitle>Order velocity</CardTitle>
              <CardDescription className="text-zinc-400">Daily order count and traffic direction.</CardDescription>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(9,9,11,0.92)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      color: '#fff',
                    }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4, fill: '#38bdf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <CardTitle>Sales mix</CardTitle>
              <CardDescription className="text-zinc-400">What customers are buying most often.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[320px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData.length > 0 ? categoryData : [{ name: 'No data', value: 1 }]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={entry.name} fill={categoryColors[index % categoryColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(9,9,11,0.92)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '16px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
              <CardDescription className="text-zinc-400">Most recent transactions and their current status.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-zinc-500">No recent orders</TableCell>
                    </TableRow>
                  )}
                  {recentOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-white/5">
                      <TableCell className="font-medium text-zinc-100">{order.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-emerald-500/15 text-emerald-200">
                              {order.user?.username?.charAt(0) || order.user?.email?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{order.user?.username || order.user?.email || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(Number(order.grandTotal) || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(order.status)}>
                          {formatStatus(order.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription className="text-zinc-400">A quick scan of the latest platform events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Total Stores', detail: `${counts?.verifiedStores || 0} verified stores on the platform`, time: 'Now', icon: PackageCheck },
                { label: 'Inventory', detail: `${counts?.totalProducts || 0} products across all stores`, time: 'Now', icon: BellRing },
                { label: 'Revenue', detail: `Total platform revenue: ${formatCurrency(totalRevenue)}`, time: 'Now', icon: CreditCard },
                { label: 'Campaign', detail: 'Homepage banner ready for weekend promo', time: '1 hour ago', icon: Sparkles },
              ].map((entry) => {
                const Icon = entry.icon;
                return (
                  <div key={entry.label} className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/5 p-4">
                    <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-300">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-medium text-zinc-50">{entry.label}</p>
                        <span className="text-xs text-zinc-500">{entry.time}</span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{entry.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-white/5 bg-gradient-to-br from-emerald-500/10 via-white/5 to-sky-500/10 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <Badge variant="success" className="w-fit bg-emerald-500/10 text-emerald-300">
                Automation ready
              </Badge>
              <CardTitle className="mt-2 text-2xl">Your admin team can act faster with this layout.</CardTitle>
              <CardDescription className="max-w-2xl text-zinc-300">
                Consistent cards, refined motion, and clearer data surfaces make the product feel current and dependable.
              </CardDescription>
            </CardHeader>
            <Separator className="bg-white/10" />
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
              {[
                { label: 'Avg. response', value: '12m' },
                { label: 'Resolved today', value: String(counts?.pendingOrders || 0) },
                { label: 'Satisfaction', value: '4.9/5' },
              ].map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">{entry.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{entry.value}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}