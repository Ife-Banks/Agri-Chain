'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  CreditCard,
  Building2,
  ChevronRight,
  QrCode,
  History,
  Shield,
  Check,
  X,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { useAuthStore } from '../../../store/auth';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

const transactions = [
  { id: 'tx1', type: 'credit', amount: 25000, description: 'Order Payment - ORD-7821', date: '2026-06-18T10:30:00', status: 'completed' },
  { id: 'tx2', type: 'debit', amount: 5000, description: 'Wallet Top-up', date: '2026-06-17T15:20:00', status: 'completed' },
  { id: 'tx3', type: 'credit', amount: 15000, description: 'Order Payment - ORD-7820', date: '2026-06-17T09:15:00', status: 'completed' },
  { id: 'tx4', type: 'debit', amount: 8500, description: 'Purchase - Fresh Organic Tomatoes', date: '2026-06-16T14:30:00', status: 'completed' },
  { id: 'tx5', type: 'credit', amount: 35000, description: 'Order Payment - ORD-7819', date: '2026-06-15T16:45:00', status: 'completed' },
];

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

export default function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [processing, setProcessing] = useState(false);

  const balance = 125000;
  const pendingBalance = 8500;

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || Number(topUpAmount) <= 0) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    setShowTopUp(false);
    setTopUpAmount('');
    alert(`Successfully topped up ${formatCurrency(Number(topUpAmount))}`);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    setShowWithdraw(false);
    setWithdrawAmount('');
    alert(`Withdrawal of ${formatCurrency(Number(withdrawAmount))} initiated`);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-8">
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
        <motion.section variants={item}>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/farmer" className="hover:text-green-600">Dashboard</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Wallet</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your funds, top up, and withdraw
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <QrCode className="h-4 w-4" />
              Show QR
            </Button>
          </div>
        </motion.section>

        <motion.section variants={item} className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card className="border-0 bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-green-100">
                    <Wallet className="h-5 w-5" />
                    <span className="text-sm font-medium">Available Balance</span>
                  </div>
                  <p className="mt-2 text-4xl font-bold">{formatCurrency(balance)}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <Shield className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button
                  className="flex-1 bg-white text-green-700 hover:bg-green-50"
                  onClick={() => setShowTopUp(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Top Up
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                  onClick={() => setShowWithdraw(true)}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
                <Button variant="ghost" size="sm" className="text-green-600">
                  View All
                  <History className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          tx.type === 'credit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {tx.type === 'credit' ? (
                          <ArrowDownLeft className="h-5 w-5" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <Badge
                        variant="success"
                        className="text-[10px]"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border border-gray-200 bg-white shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  Link New Card
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  Add Bank Account
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <History className="h-4 w-4 text-gray-400" />
                  Transaction History
                </Button>
              </div>
            </Card>

            <Card className="border border-gray-200 bg-white shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-12 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">**** 4242</p>
                      <p className="text-xs text-gray-500">Expires 12/26</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Default</Badge>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-12 rounded bg-gradient-to-r from-green-600 to-green-800 flex items-center justify-center text-white text-xs font-bold">
                      MTN
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">**** 8901</p>
                      <p className="text-xs text-gray-500">Mobile Money</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" className="w-full mt-3 text-green-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </Card>
          </div>
        </motion.section>
      </motion.div>

      {showTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Up Wallet</h3>
              <button onClick={() => setShowTopUp(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleTopUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <Input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 border-gray-200 focus:border-green-400"
                    min="100"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  {[1000, 5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt.toString())}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-sm hover:bg-gray-50"
                    >
                      ₦{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
                    <input type="radio" name="topup-method" defaultChecked className="accent-green-600" />
                    <div className="h-8 w-12 rounded bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                      VISA
                    </div>
                    <span className="text-sm text-gray-900">**** 4242</span>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={processing}>
                {processing ? 'Processing...' : `Top Up ${topUpAmount ? formatCurrency(Number(topUpAmount)) : ''}`}
              </Button>
            </form>
          </motion.div>
        </div>
      )}

      {showWithdraw && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Withdraw Funds</h3>
              <button onClick={() => setShowWithdraw(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Withdraw</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-8 border-gray-200 focus:border-green-400"
                    min="100"
                    max={balance}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Available: {formatCurrency(balance)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
                <select className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100">
                  <option value="">Select bank account</option>
                  <option value="1">First Bank - **** 1234</option>
                  <option value="2">GTBank - **** 5678</option>
                </select>
                <Button type="button" variant="ghost" size="sm" className="mt-2 text-green-600">
                  <Plus className="mr-1 h-4 w-4" />
                  Add New Bank
                </Button>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={processing}>
                {processing ? 'Processing...' : `Withdraw ${withdrawAmount ? formatCurrency(Number(withdrawAmount)) : ''}`}
              </Button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}