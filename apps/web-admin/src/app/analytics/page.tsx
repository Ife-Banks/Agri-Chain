'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminApi } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp, Users, ShoppingCart, DollarSign, Calendar, Download } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const categoryColors = ['#10b981', '#0ea5e9', '#6366f1', '#f59e0b', '#f43f5e'];
const customerColors = ['#10b981', '#0ea5e9', '#6366f1'];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.analytics(),
  });

  const analytics = data?.data;

  const revenueByDay = (analytics?.revenueByDay || []).map((d: any) => ({
    name: new Date(d.day).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    revenue: Number(d.revenue) || 0,
    orders: 0,
  }));

  const topProducts = (analytics?.topProducts || []).slice(0, 5).map((p: any) => ({
    name: p.title || 'Unknown',
    sales: Number(p.unitsSold) || 0,
    revenue: '$0',
  }));

  const categoryData = (analytics?.topProducts || []).slice(0, 5).map((p: any, i: number) => ({
    name: p.title || 'Unknown',
    value: Number(p.unitsSold) || 0,
  }));

  const customerData = [
    { name: 'New', value: analytics?.userGrowth?.length || 0 },
    { name: 'Returning', value: 0 },
    { name: 'Inactive', value: 0 },
  ];

  const totalRevenue = (analytics?.revenueByDay || []).reduce(
    (sum: number, d: any) => sum + (Number(d.revenue) || 0),
    0
  );

  const totalOrders = (analytics?.ordersByStatus || []).reduce(
    (sum: number, s: any) => sum + (Number(s.count) || 0),
    0
  );

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item} className="rounded-[28px] border border-white/5 bg-white/5 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Analytics & insights</p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">Performance metrics and trends</h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Track revenue, customer behavior, and product performance with detailed analytics.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="h-11 border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10">
              <Calendar className="mr-2 h-4 w-4" />
              Last 6 months
            </Button>
            <Button className="h-11">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: 'Total revenue', value: formatCurrency(totalRevenue), change: '+12.4%', icon: DollarSign },
            { label: 'Total orders', value: String(totalOrders || 0), change: '+8.2%', icon: ShoppingCart },
            { label: 'Active customers', value: String(analytics?.userGrowth?.length || 0), change: '+15.3%', icon: Users },
            { label: 'Avg. order value', value: totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : '$0.00', change: '+3.8%', icon: TrendingUp },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-zinc-950/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                <Badge variant="success" className="mt-2 bg-emerald-500/10 text-emerald-300">
                  {stat.change}
                </Badge>
              </div>
            );
          })}
        </div>
      </motion.section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Revenue & Orders Trend</CardTitle>
                  <CardDescription className="text-zinc-400">Daily revenue over the last 30 days.</CardDescription>
                </div>
                <Badge variant="info" className="bg-sky-500/10 text-sky-300">
                  +12.4% growth
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDay.length > 0 ? revenueByDay : [{ name: 'No data', revenue: 0, orders: 0 }]}>
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
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Line type="monotone" dataKey="orders" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, fill: '#38bdf8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription className="text-zinc-400">New user registrations over time.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-[320px] items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={72}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={entry.name} fill={customerColors[index % customerColors.length]} />
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
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <motion.div variants={item}>
          <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription className="text-zinc-400">Top products by units sold.</CardDescription>
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
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription className="text-zinc-400">Best-selling products by volume.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-white/5">
                {topProducts.length === 0 && (
                  <div className="p-4 text-center text-zinc-500">No product data available</div>
                )}
                {topProducts.map((product: any, index: number) => (
                  <div key={product.name} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-zinc-50">{product.name}</p>
                        <p className="text-sm text-zinc-400">{product.sales} units sold</p>
                      </div>
                    </div>
                    <p className="font-semibold text-zinc-50">{product.revenue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}