'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Shield, Bell, Settings as SettingsIcon, Camera, Save, X, LockKeyhole } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Separator } from '../../components/ui/separator';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { settingsApi } from '../../lib/api';
import { useAdminStore } from '../../store/adminStore';
import { useToast } from '../../components/ui/toast';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentUser, setCurrentUser } = useAdminStore();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['settings-profile'],
    queryFn: () => settingsApi.profile.get(),
  });

  const profile = profileData?.data;

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => settingsApi.profile.update(data),
    onSuccess: (response) => {
      toast({ title: 'Profile updated', description: 'Your profile has been saved.', type: 'success' });
      const data = response.data;
      setCurrentUser({
        ...currentUser!,
        name: data.username || data.email,
        email: data.email,
      });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update profile', type: 'error' });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: any) => settingsApi.password.change(data),
    onSuccess: () => {
      toast({ title: 'Password changed', description: 'Your password has been updated.', type: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to change password', type: 'error' });
    },
  });

  const setPinMutation = useMutation({
    mutationFn: (data: any) => settingsApi.pin.set(data),
    onSuccess: () => {
      toast({ title: 'PIN set', description: 'Your wallet PIN has been configured.', type: 'success' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to set PIN', type: 'error' });
    },
  });

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = {
      username: (form.elements.namedItem('username') as HTMLInputElement)?.value,
      phoneNumber: (form.elements.namedItem('phoneNumber') as HTMLInputElement)?.value,
    };
    await updateProfileMutation.mutateAsync(data);
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem('currentPassword') as HTMLInputElement)?.value;
    const newPassword = (form.elements.namedItem('newPassword') as HTMLInputElement)?.value;
    const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement)?.value;
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', type: 'error' });
      return;
    }
    await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
    form.reset();
  };

  const handleSetPin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newPin = (form.elements.namedItem('newPin') as HTMLInputElement)?.value;
    const confirmPin = (form.elements.namedItem('confirmPin') as HTMLInputElement)?.value;
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      toast({ title: 'Error', description: 'PIN must be exactly 4 digits', type: 'error' });
      return;
    }
    if (newPin !== confirmPin) {
      toast({ title: 'Error', description: 'PINs do not match', type: 'error' });
      return;
    }
    await setPinMutation.mutateAsync({ newPin });
    form.reset();
  };

  if (profileLoading) {
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
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Settings</p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">Account and preferences</h2>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Manage your profile, security settings, and notification preferences.
          </p>
        </div>
      </motion.section>

      <motion.div variants={item}>
        <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/5">
                <TabsTrigger value="profile" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                  <Shield className="mr-2 h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                  <Bell className="mr-2 h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="general" className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-300">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  General
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6 space-y-6">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-emerald-500/15 text-emerald-300 text-2xl">
                        {(profile?.username || currentUser?.name || 'A').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Profile Picture</h3>
                      <p className="text-sm text-zinc-400">PNG, JPG up to 5MB</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10" disabled>
                          <Camera className="mr-2 h-4 w-4" />
                          Upload New
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/10" />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        defaultValue={profile?.username || ''}
                        className="mt-2 border-white/10 bg-white/5 text-zinc-100"
                        placeholder="Your username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={profile?.email || ''}
                        disabled
                        className="mt-2 border-white/10 bg-white/5 text-zinc-100 opacity-50"
                      />
                      <p className="mt-1 text-xs text-zinc-500">Email cannot be changed</p>
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        defaultValue={profile?.phoneNumber || ''}
                        className="mt-2 border-white/10 bg-white/5 text-zinc-100"
                        placeholder="+2348012345678"
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input
                        value={profile?.isAdmin ? 'Administrator' : profile?.isFarmer ? 'Farmer' : 'User'}
                        disabled
                        className="mt-2 border-white/10 bg-white/5 text-zinc-100 opacity-50"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" loading={updateProfileMutation.isPending}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="security" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-300">Change Password</h4>
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        name="currentPassword"
                        type="password"
                        placeholder="Enter current password"
                        className="mt-2 border-white/10 bg-white/5 text-zinc-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        name="newPassword"
                        type="password"
                        placeholder="Enter new password"
                        className="mt-2 border-white/10 bg-white/5 text-zinc-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        className="mt-2 border-white/10 bg-white/5 text-zinc-100"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" loading={changePasswordMutation.isPending} size="sm">
                        Update Password
                      </Button>
                    </div>
                  </form>

                  <Separator className="bg-white/10" />

                  <form onSubmit={handleSetPin} className="space-y-4">
                    <h4 className="text-sm font-semibold text-zinc-300">Wallet PIN</h4>
                    <p className="text-sm text-zinc-400">Set a 4-digit PIN for wallet operations (withdraw, transfer, freeze).</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="newPin">New PIN (4 digits)</Label>
                        <Input
                          id="newPin"
                          name="newPin"
                          type="password"
                          maxLength={4}
                          pattern="\d{4}"
                          placeholder="1234"
                          className="mt-2 border-white/10 bg-white/5 text-zinc-100"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPin">Confirm PIN</Label>
                        <Input
                          id="confirmPin"
                          name="confirmPin"
                          type="password"
                          maxLength={4}
                          pattern="\d{4}"
                          placeholder="1234"
                          className="mt-2 border-white/10 bg-white/5 text-zinc-100"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" loading={setPinMutation.isPending} size="sm" variant="outline" className="border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10">
                        <LockKeyhole className="mr-2 h-4 w-4" />
                        Set PIN
                      </Button>
                    </div>
                  </form>

                  <Separator className="bg-white/10" />

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">Two-Factor Authentication</h4>
                      <p className="text-sm text-zinc-400">Add an extra layer of security to your account</p>
                    </div>
                    <Switch disabled />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">Login Notifications</h4>
                      <p className="text-sm text-zinc-400">Get notified when someone logs into your account</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">Email Notifications</h4>
                      <p className="text-sm text-zinc-400">Receive email notifications for important events</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">New Orders</h4>
                      <p className="text-sm text-zinc-400">Get notified when new orders are placed</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">User Registrations</h4>
                      <p className="text-sm text-zinc-400">Get notified when new users register</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">Low Stock Alerts</h4>
                      <p className="text-sm text-zinc-400">Get notified when products are low on stock</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">Push Notifications</h4>
                      <p className="text-sm text-zinc-400">Receive push notifications in your browser</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div>
                      <h4 className="font-medium text-zinc-50">SMS Notifications</h4>
                      <p className="text-sm text-zinc-400">Receive SMS notifications for critical alerts</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="general" className="mt-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="site-name">Platform Name</Label>
                    <Input id="site-name" defaultValue="AI-SUCE" className="mt-2 border-white/10 bg-white/5 text-zinc-100" />
                  </div>
                  <div>
                    <Label htmlFor="site-description">Platform Description</Label>
                    <Textarea
                      id="site-description"
                      defaultValue="Agricultural technology platform connecting farmers with buyers"
                      className="mt-2 min-h-[100px] border-white/10 bg-white/5 text-zinc-100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select id="timezone" className="mt-2 border-white/10 bg-white/5 text-zinc-100" defaultValue="Africa/Lagos">
                      <option value="UTC">UTC</option>
                      <option value="Africa/Lagos">Africa/Lagos</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="America/Los_Angeles">America/Los_Angeles</option>
                      <option value="Europe/London">Europe/London</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select id="language" className="mt-2 border-white/10 bg-white/5 text-zinc-100" defaultValue="English">
                      <option>English</option>
                      <option>French</option>
                      <option>Spanish</option>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}