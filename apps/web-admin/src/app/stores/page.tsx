'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { Store as StoreIcon, Search, ShieldCheck, ShieldOff, MapPin, Phone, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Pagination } from '../../components/ui/pagination';
import { useStores } from '../../hooks/useStores';
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

export default function StoresPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { stores, total, page, totalPages, isLoading, verifyStoreAsync, deactivateStoreAsync } = useStores({
    page: 1,
    limit: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredStores = React.useMemo(
    () =>
      stores.filter(
        (store: any) =>
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.address?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [stores, searchQuery]
  );

  const handleVerify = async (id: string, name: string) => {
    try {
      await verifyStoreAsync(id);
      toast({ title: 'Store verified', description: `${name} has been verified.`, type: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to verify store', type: 'error' });
    }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate store ${name}?`)) return;
    try {
      await deactivateStoreAsync(id);
      toast({ title: 'Store deactivated', description: `${name} has been deactivated.`, type: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to deactivate store', type: 'error' });
    }
  };

  const stats = [
    { label: 'Total Stores', value: stores.length, icon: StoreIcon },
    { label: 'Verified', value: stores.filter((s: any) => s.isVerified).length, icon: ShieldCheck },
    { label: 'Unverified', value: stores.filter((s: any) => !s.isVerified).length, icon: ShieldOff },
    { label: 'Inactive', value: stores.filter((s: any) => !s.isActive).length, icon: XCircle },
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
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Store management</p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">Verified storefronts</h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Review, verify, and manage vendor and farmer stores on the platform.
            </p>
          </div>
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
          <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>All Stores</CardTitle>
              <CardDescription className="text-zinc-400">Search and manage store verification status.</CardDescription>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search stores, email, or address"
                  className="h-11 border-white/10 bg-white/5 pl-9 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Store</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-16 text-center">
                      <p className="text-lg font-medium text-zinc-50">No stores found</p>
                      <p className="mt-2 text-sm text-zinc-400">Try a different search term.</p>
                    </TableCell>
                  </TableRow>
                )}
                {filteredStores.map((store: any) => (
                  <TableRow key={store.id} className="border-white/5">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                          <StoreIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-50">{store.name}</p>
                          <p className="text-sm text-zinc-400">/{store.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                          <Mail className="h-3.5 w-3.5 text-zinc-500" />
                          {store.email || 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-zinc-300">
                          <Phone className="h-3.5 w-3.5 text-zinc-500" />
                          {store.phoneNumber || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-300 max-w-[200px]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                        <span className="truncate">{store.address || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.isActive ? 'success' : 'destructive'}>
                        {store.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={store.isVerified ? 'success' : 'warning'}>
                        {store.isVerified ? (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        ) : (
                          <ShieldOff className="mr-1 h-3 w-3" />
                        )}
                        {store.isVerified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2">
                        {!store.isVerified && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
                            onClick={() => handleVerify(store.id, store.name)}
                          >
                            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                            Verify
                          </Button>
                        )}
                        {store.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            onClick={() => handleDeactivate(store.id, store.name)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}