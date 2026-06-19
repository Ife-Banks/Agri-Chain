'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Separator } from '../../../components/ui/separator';
import { Avatar } from '../../../components/ui/avatar';
import { useAuthStore } from '../../../store/auth';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

interface ProfileForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  farmName: string;
  farmAddress: string;
  description: string;
}

interface BankForm {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function FarmerProfilePage() {
  const user = useAuthStore((s) => s.user);

  const [profile, setProfile] = useState<ProfileForm>({
    firstName: 'Emeka',
    lastName: 'Okafor',
    username: user?.username || 'emeka_okafor',
    email: user?.email || 'emeka.okafor@email.com',
    phone: '08098765432',
    farmName: 'Okafor Organic Farm',
    farmAddress: '15 Farm Road, Nm篷 Enugu State',
    description: 'Family-run organic farm specializing in vegetables and tubers. Established 2015.',
  });

  const [bank, setBank] = useState<BankForm>({
    bankName: 'First Bank of Nigeria',
    accountName: 'Emeka Okafor',
    accountNumber: '2034567890',
  });

  const [password, setPassword] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [saving, setSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [bankSaved, setBankSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setBankSaved(true);
    setTimeout(() => setBankSaved(false), 3000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.newPassword !== password.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setPasswordSaved(true);
    setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  const updateProfile = (field: keyof ProfileForm, value: string) => {
    setProfile({ ...profile, [field]: value });
    setProfileSaved(false);
  };

  const updateBank = (field: keyof BankForm, value: string) => {
    setBank({ ...bank, [field]: value });
    setBankSaved(false);
  };

  const updatePassword = (field: keyof PasswordForm, value: string) => {
    setPassword({ ...password, [field]: value });
    setPasswordSaved(false);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item}>
        <div className="mb-6">
          <Badge className="bg-green-100 text-green-700 border-green-200">Profile</Badge>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-900">
            My Profile
          </h1>
          <p className="mt-1 text-gray-500">
            Manage your account settings and farm information
          </p>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <motion.div variants={item} className="space-y-6">
          <Card className="border-[rgba(203,213,224,0.6)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[rgba(203,213,224,0.4)] p-5">
              <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your personal details
              </p>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => updateProfile('firstName', e.target.value)}
                  placeholder="Your first name"
                />
                <Input
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => updateProfile('lastName', e.target.value)}
                  placeholder="Your last name"
                />
              </div>
              <Input
                label="Username"
                value={profile.username}
                onChange={(e) => updateProfile('username', e.target.value)}
                placeholder="Your username"
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
                placeholder="Your email"
              />
              <Input
                label="Phone Number"
                type="tel"
                value={profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
                placeholder="Your phone number"
              />
              <Separator />
              <Input
                label="Farm Name"
                value={profile.farmName}
                onChange={(e) => updateProfile('farmName', e.target.value)}
                placeholder="Your farm name"
              />
              <Input
                label="Farm Address"
                value={profile.farmAddress}
                onChange={(e) => updateProfile('farmAddress', e.target.value)}
                placeholder="Your farm address"
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  Farm Description
                </label>
                <textarea
                  value={profile.description}
                  onChange={(e) => updateProfile('description', e.target.value)}
                  placeholder="Describe your farm..."
                  rows={3}
                  className="w-full rounded-xl border border-[rgba(203,213,224,0.6)] bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-green-400 focus:shadow-[0_8px_24px_rgba(15,74,40,0.12)] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" className="rounded-xl" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                {profileSaved && (
                  <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>
                )}
              </div>
            </form>
          </Card>

          <Card className="border-[rgba(203,213,224,0.6)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[rgba(203,213,224,0.4)] p-5">
              <h2 className="text-lg font-bold text-gray-900">Bank Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your payout information
              </p>
            </div>
            <form onSubmit={handleBankSubmit} className="p-5 space-y-4">
              <Input
                label="Bank Name"
                value={bank.bankName}
                onChange={(e) => updateBank('bankName', e.target.value)}
                placeholder="Your bank name"
              />
              <Input
                label="Account Name"
                value={bank.accountName}
                onChange={(e) => updateBank('accountName', e.target.value)}
                placeholder="Your account name"
              />
              <Input
                label="Account Number"
                value={bank.accountNumber}
                onChange={(e) => updateBank('accountNumber', e.target.value)}
                placeholder="Your account number"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" className="rounded-xl" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Bank Details'}
                </Button>
                {bankSaved && (
                  <span className="text-sm text-green-600 font-medium">✓ Saved successfully</span>
                )}
              </div>
            </form>
          </Card>

          <Card className="border-[rgba(203,213,224,0.6)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <div className="border-b border-[rgba(203,213,224,0.4)] p-5">
              <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
              <p className="mt-1 text-sm text-gray-500">
                Update your password to keep your account secure
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-5 space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={password.currentPassword}
                onChange={(e) => updatePassword('currentPassword', e.target.value)}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={password.newPassword}
                onChange={(e) => updatePassword('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={password.confirmPassword}
                onChange={(e) => updatePassword('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
              />
              <div className="flex items-center gap-3">
                <Button type="submit" className="rounded-xl" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Password'}
                </Button>
                {passwordSaved && (
                  <span className="text-sm text-green-600 font-medium">✓ Password updated</span>
                )}
              </div>
            </form>
          </Card>
        </motion.div>

        <motion.div variants={item} className="space-y-6">
          <Card className="border-[rgba(203,213,224,0.6)] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-6">
            <div className="text-center">
              <Avatar size={80} className="mx-auto text-3xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-700">
                {profile.firstName.charAt(0)}
              </Avatar>
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-sm text-gray-500">{profile.farmName}</p>
              <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">Verified Farmer</Badge>
            </div>
            <Separator className="my-4" />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Member since</span>
                <span className="font-medium text-gray-900">June 2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Products</span>
                <span className="font-medium text-gray-900">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Orders</span>
                <span className="font-medium text-gray-900">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rating</span>
                <span className="font-medium text-green-700">4.8/5.0</span>
              </div>
            </div>
          </Card>

          <Card className="border-[rgba(203,213,224,0.6)] bg-gradient-to-br from-red-50 to-orange-50 shadow-[0_8px_24px_rgba(15,23,42,0.06)] p-6">
            <h3 className="font-bold text-gray-900">Danger Zone</h3>
            <p className="mt-1 text-sm text-gray-600">
              Permanently delete your account and all data
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              Delete Account
            </Button>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}