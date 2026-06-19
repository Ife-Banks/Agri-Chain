'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus, Search, Users as UsersIcon, Shield, CircleUserRound } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { UserForm } from '../../components/UserForm';
import { useUsers } from '../../hooks/useUsers';
import type { UserFormData } from '../../lib/validations/userSchema';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useToast } from '../../components/ui/toast';

const PAGE_SIZE = 10;

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { users, total, isLoading, deleteUserAsync, createUserAsync, updateUserAsync } = useUsers();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any>(null);

  const filteredUsers = React.useMemo(
    () =>
      users.filter(
        (user: any) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.role.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, users]
  );

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAddUser = async (data: UserFormData) => {
    try {
      await createUserAsync(data);
      toast({ title: 'User created', description: `${data.username} has been added.`, type: 'success' });
      setIsCreateOpen(false);
      setCurrentPage(1);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to create user', type: 'error' });
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
  };

  const handleUpdateUser = async (data: UserFormData) => {
    if (!editingUser) return;
    try {
      await updateUserAsync({ id: editingUser.id, data });
      toast({ title: 'User updated', description: `${data.username} has been updated.`, type: 'success' });
      setEditingUser(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update user', type: 'error' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete user ${name}?`)) return;
    try {
      await deleteUserAsync(id);
      toast({ title: 'User deleted', description: `${name} has been removed.`, type: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete user', type: 'error' });
    }
  };

  const stats = [
    { label: 'Total users', value: users.length.toString(), icon: UsersIcon },
    { label: 'Active admins', value: users.filter((u: any) => u.role === 'Admin').length.toString(), icon: Shield },
    { label: 'Pending approvals', value: users.filter((u: any) => u.status === 'Pending').length.toString(), icon: CircleUserRound },
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
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">User management</p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">Team access and customer accounts</h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Manage who can access the admin console, review account activity, and keep your user base organized.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="h-11 w-fit">
            <Plus className="h-4 w-4" />
            Add user
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
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
              <CardTitle>Users</CardTitle>
              <CardDescription className="text-zinc-400">Search, review, and maintain user access.</CardDescription>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search users, email, or role"
                className="h-11 border-white/10 bg-white/5 pl-9 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user: any) => (
                    <TableRow key={user.id} className="border-white/5">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-emerald-500/15 text-emerald-200">{user.name?.charAt(0) || '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-zinc-50">{user.name}</p>
                            <p className="text-sm text-zinc-400">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === 'Admin' ? 'success' : user.role === 'Moderator' ? 'info' : 'secondary'}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'secondary'}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">{user.createdAt}</TableCell>
                      <TableCell className="text-zinc-300">{user.lastLogin}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-300 hover:bg-white/5 hover:text-white"
                            onClick={() => handleEditUser(user)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            onClick={() => handleDelete(user.id, user.name)}
                          >
                            Delete
                          </Button>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-white/5 hover:text-white">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-white/5">
                    <TableCell colSpan={6} className="py-16 text-center">
                      <p className="text-lg font-medium text-zinc-50">No users found</p>
                      <p className="mt-2 text-sm text-zinc-400">Try a different search term or create a new user.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-4 border-t border-white/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-zinc-400">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} users
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  className="border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  className="border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent title="Add new user">
          <UserForm
            onSubmit={handleAddUser}
            onCancel={() => setIsCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent title="Edit user">
          {editingUser && (
            <UserForm
              defaultValues={{
                username: editingUser.name,
                email: editingUser.email,
                phone: '',
                password: '',
                isAdmin: editingUser.role === 'Admin',
                isFarmer: editingUser.role === 'Farmer',
                isAgricEnterprise: editingUser.role === 'Moderator',
              }}
              onSubmit={handleUpdateUser}
              onCancel={() => setEditingUser(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}