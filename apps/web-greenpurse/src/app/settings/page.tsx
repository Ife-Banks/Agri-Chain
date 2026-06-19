'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Shield,
  Bell,
  Camera,
  Save,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MessageSquare,
  Check,
  ChevronRight,
  Loader2,
  QrCode,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Separator } from '../../../components/ui/separator';
import { Avatar } from '../../../components/ui/avatar';
import { ImageUpload } from '../../../components/ui/image-upload';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

type Tab = 'profile' | 'security' | 'notifications';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
        <motion.section variants={item}>
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <a href="/farmer" className="hover:text-green-600">Dashboard</a>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">Settings</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your profile, security settings, and notification preferences.
          </p>
        </motion.section>

        <motion.div variants={item}>
          <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              {[
                { id: 'profile' as Tab, label: 'Profile', icon: User },
                { id: 'security' as Tab, label: 'Security', icon: Shield },
                { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'border-b-2 border-green-600 text-green-600 bg-green-50/50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'security' && <SecurityTab />}
              {activeTab === 'notifications' && <NotificationsTab />}
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProfileTab() {
  const [form, setForm] = useState({
    firstName: 'Simeon',
    lastName: 'Bankole',
    email: 'simbanks05@gmail.com',
    phone: '+234 803 456 7890',
    farmName: 'Bankole Farms',
    farmAddress: '15 Farm Road, Ikenne, Ogun State',
    avatar: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAvatarUpload = async (url: string) => {
    setForm({ ...form, avatar: url });
    setShowUploadModal(false);
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar size={80} className="bg-green-100 text-green-700 text-2xl">
              {form.avatar ? (
                <img src={form.avatar} alt="Avatar" className="h-full w-full object-cover rounded-full" />
              ) : (
                form.firstName.charAt(0)
              )}
            </Avatar>
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
            >
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
            <div className="mt-2 flex gap-2">
              <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => setShowUploadModal(true)}>
                Upload New
              </Button>
              {form.avatar && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-xs text-red-600"
                  onClick={() => setForm({ ...form, avatar: '' })}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <Input
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="border-gray-200 focus:border-green-400 focus:ring-green-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <Input
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="border-gray-200 focus:border-green-400 focus:ring-green-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border-gray-200 focus:border-green-400 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <Input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border-gray-200 focus:border-green-400 focus:ring-green-100"
          />
        </div>

        <Separator />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
          <Input
            value={form.farmName}
            onChange={(e) => setForm({ ...form, farmName: e.target.value })}
            className="border-gray-200 focus:border-green-400 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Farm Address</label>
          <Input
            value={form.farmAddress}
            onChange={(e) => setForm({ ...form, farmAddress: e.target.value })}
            className="border-gray-200 focus:border-green-400 focus:ring-green-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
            {saving ? 'Saving...' : saved ? <><Check className="mr-2 h-4 w-4" /> Saved</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
          </Button>
          {saved && !saving && (
            <span className="text-sm text-green-600">Changes saved successfully</span>
          )}
        </div>
      </form>

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Update Profile Picture</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ImageUpload
              value={form.avatar}
              onChange={handleAvatarUpload}
              placeholder="Enter image URL"
            />
          </div>
        </div>
      )}
    </>
  );
}

function SecurityTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwords.new !== passwords.confirm) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  const handle2FAToggle = async () => {
    if (twoFAEnabled) {
      const code = prompt('Enter the 6-digit code to disable 2FA:');
      if (!code) return;
      setTwoFALoading(true);
      await new Promise((r) => setTimeout(r, 1500));
      setTwoFALoading(false);
      setTwoFAEnabled(false);
    } else {
      setTwoFALoading(true);
      await new Promise((r) => setTimeout(r, 1500));
      setQrCode('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      setShow2FAModal(true);
      setTwoFALoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (verifyCode.length !== 6) return;
    setTwoFALoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setTwoFAEnabled(true);
    setShow2FAModal(false);
    setVerifyCode('');
    setTwoFALoading(false);
  };

  return (
    <>
      <div className="space-y-6">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>

          {passwordError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{passwordError}</div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <Input
              type={showCurrent ? 'text' : 'password'}
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
              placeholder="Enter current password"
              className="pr-10 border-gray-200 focus:border-green-400 focus:ring-green-100"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <Input
              type={showNew ? 'text' : 'password'}
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
              placeholder="Enter new password"
              className="pr-10 border-gray-200 focus:border-green-400 focus:ring-green-100"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <Input
              type={showConfirm ? 'text' : 'password'}
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              placeholder="Confirm new password"
              className="pr-10 border-gray-200 focus:border-green-400 focus:ring-green-100"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </form>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Security Options</h3>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
            </div>
            <button
              onClick={handle2FAToggle}
              disabled={twoFALoading}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                twoFAEnabled ? 'bg-green-600' : 'bg-gray-200'
              } ${twoFALoading ? 'opacity-50' : ''}`}
            >
              {twoFALoading ? (
                <Loader2 className="absolute inset-0 m-auto h-4 w-4 animate-spin text-white" />
              ) : (
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    twoFAEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Login Notifications</h4>
                <p className="text-sm text-gray-500">Get notified when someone logs into your account</p>
              </div>
            </div>
            <button
              onClick={() => setLoginAlerts(!loginAlerts)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                loginAlerts ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  loginAlerts ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Enable 2FA</h3>
              <button onClick={() => setShow2FAModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4 flex justify-center">
              <div className="rounded-xl bg-gray-100 p-4">
                {qrCode && <img src={qrCode} alt="2FA QR Code" className="h-48 w-48" />}
              </div>
            </div>
            <p className="mb-4 text-center text-sm text-gray-500">
              Scan the QR code with your authenticator app, then enter the verification code below.
            </p>
            <div className="mb-4">
              <Input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button onClick={handle2FAVerify} className="w-full bg-green-600 hover:bg-green-700" disabled={verifyCode.length !== 6 || twoFALoading}>
              {twoFALoading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    sms: false,
    newOrders: true,
    orderUpdates: true,
    payments: true,
    lowStock: true,
    promotions: false,
  });
  const [saving, setSaving] = useState(false);

  const toggle = async (key: keyof typeof settings) => {
    setSaving(true);
    setSettings({ ...settings, [key]: !settings[key] });
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
  };

  const ToggleSwitch = ({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) => (
    <button
      onClick={onChange}
      disabled={disabled || saving}
      className={`relative h-6 w-11 rounded-full transition-colors ${
        enabled ? 'bg-green-600' : 'bg-gray-200'
      } ${(disabled || saving) ? 'opacity-50' : ''}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notification Channels</h3>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
            </div>
          </div>
          <ToggleSwitch enabled={settings.email} onChange={() => toggle('email')} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
              <Smartphone className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Push Notifications</h4>
              <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
            </div>
          </div>
          <ToggleSwitch enabled={settings.push} onChange={() => toggle('push')} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <MessageSquare className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">SMS Notifications</h4>
              <p className="text-sm text-gray-500">Receive SMS for critical alerts</p>
            </div>
          </div>
          <ToggleSwitch enabled={settings.sms} onChange={() => toggle('sms')} />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notification Types</h3>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div>
            <h4 className="font-medium text-gray-900">New Orders</h4>
            <p className="text-sm text-gray-500">Get notified when new orders are placed</p>
          </div>
          <ToggleSwitch enabled={settings.newOrders} onChange={() => toggle('newOrders')} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div>
            <h4 className="font-medium text-gray-900">Order Updates</h4>
            <p className="text-sm text-gray-500">Track order status changes</p>
          </div>
          <ToggleSwitch enabled={settings.orderUpdates} onChange={() => toggle('orderUpdates')} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div>
            <h4 className="font-medium text-gray-900">Payment Notifications</h4>
            <p className="text-sm text-gray-500">Updates on payments and transactions</p>
          </div>
          <ToggleSwitch enabled={settings.payments} onChange={() => toggle('payments')} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div>
            <h4 className="font-medium text-gray-900">Low Stock Alerts</h4>
            <p className="text-sm text-gray-500">Get notified when inventory is running low</p>
          </div>
          <ToggleSwitch enabled={settings.lowStock} onChange={() => toggle('lowStock')} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4">
          <div>
            <h4 className="font-medium text-gray-900">Promotions & Deals</h4>
            <p className="text-sm text-gray-500">News about special offers and promotions</p>
          </div>
          <ToggleSwitch enabled={settings.promotions} onChange={() => toggle('promotions')} />
        </div>
      </div>
    </div>
  );
}