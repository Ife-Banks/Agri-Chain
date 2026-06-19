'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  X,
  Save,
  Percent,
  Calendar,
  Clock,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Pagination } from '../../components/ui/pagination';
import { Loader2 } from 'lucide-react';
import { useCoupons } from '../../hooks/useCoupons';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount: number;
  uses: number;
  maxUses: number;
  expiresAt: string;
  isActive: boolean;
}

const mockCoupons: Coupon[] = [
  { id: '1', code: 'WELCOME10', description: '10% off first order', discountType: 'percent', discountValue: 10, minOrder: 5000, maxDiscount: 2000, uses: 234, maxUses: 1000, expiresAt: '2026-12-31', isActive: true },
  { id: '2', code: 'FRESH20', description: '20% off on fresh produce', discountType: 'percent', discountValue: 20, minOrder: 10000, maxDiscount: 5000, uses: 89, maxUses: 500, expiresAt: '2026-08-15', isActive: true },
  { id: '3', code: 'FLAT500', description: '₦500 off orders above ₦5000', discountType: 'fixed', discountValue: 500, minOrder: 5000, maxDiscount: 500, uses: 456, maxUses: 2000, expiresAt: '2026-07-30', isActive: true },
  { id: '4', code: 'BULK15', description: '15% off bulk orders', discountType: 'percent', discountValue: 15, minOrder: 25000, maxDiscount: 10000, uses: 34, maxUses: 200, expiresAt: '2026-06-30', isActive: false },
  { id: '5', code: 'SUMMER25', description: 'Summer special - 25% off', discountType: 'percent', discountValue: 25, minOrder: 15000, maxDiscount: 7500, uses: 567, maxUses: 3000, expiresAt: '2026-09-01', isActive: true },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState(mockCoupons);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [useApi, setUseApi] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: '',
    minOrder: '',
    maxDiscount: '',
    maxUses: '',
    expiresAt: '',
  });

  const { coupons: apiCoupons, total, totalPages, isLoading, createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useCoupons({
    page,
    limit: pageSize,
    search,
  });

  useEffect(() => {
    if (useApi && apiCoupons.length > 0) {
      setCoupons(apiCoupons);
    } else if (!useApi) {
      setCoupons(mockCoupons);
    }
  }, [apiCoupons, useApi]);

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    const data = {
      ...form,
      discountValue: Number(form.discountValue),
      minOrder: Number(form.minOrder),
      maxDiscount: Number(form.maxDiscount),
      maxUses: Number(form.maxUses),
      uses: editingCoupon?.uses || 0,
    };

    if (useApi) {
      if (editingCoupon) {
        updateCoupon({ id: editingCoupon.id, data });
      } else {
        createCoupon(data);
      }
      setShowModal(false);
      setEditingCoupon(null);
      setForm({ code: '', description: '', discountType: 'percent', discountValue: '', minOrder: '', maxDiscount: '', maxUses: '', expiresAt: '' });
    } else {
      if (editingCoupon) {
        setCoupons((prev) => prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...data } : c)));
      } else {
        setCoupons((prev) => [{ id: Date.now().toString(), ...data, isActive: true }, ...prev]);
      }
      setShowModal(false);
      setEditingCoupon(null);
      setForm({ code: '', description: '', discountType: 'percent', discountValue: '', minOrder: '', maxDiscount: '', maxUses: '', expiresAt: '' });
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrder: coupon.minOrder.toString(),
      maxDiscount: coupon.maxDiscount.toString(),
      maxUses: coupon.maxUses.toString(),
      expiresAt: coupon.expiresAt,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      if (useApi) {
        deleteCoupon(id);
      } else {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      }
    }
  };

  const toggleActive = (id: string) => {
    if (useApi) {
      toggleCouponStatus(id);
    } else {
      setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item}>
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
          <a href="/" className="hover:text-emerald-400">Dashboard</a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-zinc-50">Coupons</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">Coupons</h1>
            <p className="mt-1 text-sm text-zinc-400">Manage discount coupons and promotions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setUseApi(!useApi)}
              className={`text-xs px-3 py-1.5 rounded-lg border ${
                useApi
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
            >
              {useApi ? 'Using API' : 'Using Mock Data'}
            </button>
            <Button onClick={() => { setEditingCoupon(null); setForm({ code: '', description: '', discountType: 'percent', discountValue: '', minOrder: '', maxDiscount: '', maxUses: '', expiresAt: '' }); setShowModal(true); }} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400">
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.section variants={item}>
        <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
          <div className="border-b border-white/10 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search coupons..." className="pl-10 border-white/10 bg-white/5 text-zinc-100 placeholder:text-zinc-500" />
              </div>
              {useApi && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={pageSize}
                  onPageChange={setPage}
                  onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
                />
              )}
            </div>
          </div>

          {isLoading && useApi ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-4 hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                      <Ticket className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-zinc-50">{coupon.code}</p>
                        <button onClick={() => copyCode(coupon.code)} className="text-zinc-400 hover:text-zinc-50">
                          {copied === coupon.code ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-zinc-400">{coupon.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">
                        {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)} OFF
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Min order: {formatCurrency(coupon.minOrder)} | Max: {formatCurrency(coupon.maxDiscount)}
                      </p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                        <Calendar className="h-3 w-3" /> Expires: {coupon.expiresAt}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-zinc-50">{coupon.uses}/{coupon.maxUses}</p>
                      <p className="text-xs text-zinc-500">uses</p>
                    </div>
                    <Badge variant={coupon.isActive ? 'success' : 'secondary'} className="bg-emerald-500/10 text-emerald-300">{coupon.isActive ? 'Active' : 'Expired'}</Badge>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(coupon)} className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-zinc-50"><Edit2 className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(coupon.id)} className="rounded-lg p-2 text-zinc-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-4 w-4" /></button>
                      <button onClick={() => toggleActive(coupon.id)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${coupon.isActive ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-50">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-50"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Coupon Code</label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" className="border-white/10 bg-white/5 text-zinc-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Discount Type</label>
                  <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percent' | 'fixed' })} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-zinc-100">
                    <option value="percent">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Description</label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g., 10% off first order" className="border-white/10 bg-white/5 text-zinc-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">{form.discountType === 'percent' ? 'Discount %' : 'Discount Amount (₦)'}</label>
                  <Input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} placeholder="10" className="border-white/10 bg-white/5 text-zinc-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Max Discount (₦)</label>
                  <Input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} placeholder="2000" className="border-white/10 bg-white/5 text-zinc-100" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Min Order (₦)</label>
                  <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} placeholder="5000" className="border-white/10 bg-white/5 text-zinc-100" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">Max Uses</label>
                  <Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="1000" className="border-white/10 bg-white/5 text-zinc-100" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Expires At</label>
                <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="border-white/10 bg-white/5 text-zinc-100" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)} className="border-white/10 text-zinc-50 hover:bg-white/5">Cancel</Button>
              <Button onClick={handleSave} className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400"><Save className="mr-2 h-4 w-4" />{editingCoupon ? 'Save Changes' : 'Create Coupon'}</Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}