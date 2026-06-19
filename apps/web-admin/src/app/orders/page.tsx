'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Truck, Clock3, CheckCircle2, PackageSearch } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useOrders } from '../../hooks/useOrders';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../components/ui/toast';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const STATUS_OPTIONS = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { orders, isLoading, updateOrderStatusAsync } = useOrders();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | string>('all');
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);

  const filteredOrders = React.useMemo(
    () =>
      orders.filter((order: any) => {
        const matchesSearch =
          order.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [orders, searchQuery, statusFilter]
  );

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusAsync({ id: orderId, status: newStatus });
      toast({ title: 'Order updated', description: `Order status changed to ${newStatus}.`, type: 'success' });
      setSelectedOrder(null);
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update order', type: 'error' });
    }
  };

  const stats = [
    { label: 'Pending', value: orders.filter((o: any) => o.status === 'Pending').length, icon: Clock3 },
    { label: 'Shipped', value: orders.filter((o: any) => o.status === 'Shipped').length, icon: Truck },
    { label: 'Delivered', value: orders.filter((o: any) => o.status === 'Delivered').length, icon: CheckCircle2 },
    { label: 'In review', value: orders.filter((o: any) => o.status === 'Processing').length, icon: PackageSearch },
  ];

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
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Order operations</p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">Orders and fulfillment</h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Track delivery status, scan customer orders, and keep the fulfillment queue moving.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-white/5 bg-zinc-950/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-zinc-400">{stat.label}</p>
                  <Icon className="h-4 w-4 text-emerald-400" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.div variants={item}>
        <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
          <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Fulfillment queue</CardTitle>
              <CardDescription className="text-zinc-400">Search and filter orders by current delivery status.</CardDescription>
            </div>
            <div className="flex w-full flex-col gap-3 lg:max-w-2xl lg:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search order ID, customer, or email"
                  className="h-11 border-white/10 bg-white/5 pl-9 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              <div className="relative w-full lg:w-56">
                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 border-white/10 bg-white/5 pl-9 text-zinc-100"
                >
                  <option value="all">All statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order.id} className="border-white/5">
                      <TableCell className="font-mono text-sm text-zinc-300">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-zinc-50">{order.customer}</p>
                          <p className="text-sm text-zinc-400">{order.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-300">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === 'Delivered'
                              ? 'success'
                              : order.status === 'Processing'
                              ? 'info'
                              : order.status === 'Shipped'
                              ? 'secondary'
                              : order.status === 'Pending'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">{order.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="text-zinc-300 hover:bg-white/5 hover:text-white">
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-300 hover:bg-white/5 hover:text-white"
                            onClick={() => setSelectedOrder(order)}
                          >
                            Update
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-white/5">
                    <TableCell colSpan={6} className="py-16 text-center">
                      <p className="text-lg font-medium text-zinc-50">No matching orders</p>
                      <p className="mt-2 text-sm text-zinc-400">Try clearing the filters or search with a different term.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-soft w-full max-w-md">
            <h3 className="text-lg font-semibold text-zinc-50 mb-4">Update Order Status</h3>
            <p className="text-sm text-zinc-400 mb-4">Order: {selectedOrder.id}</p>
            <Select
              id="status"
              defaultValue={selectedOrder.status}
              className="mb-6"
              onChange={(e) => {}}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>Cancel</Button>
              <Button
                onClick={async () => {
                  const select = document.getElementById('status') as HTMLSelectElement;
                  await handleUpdateStatus(selectedOrder.id, select.value);
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}