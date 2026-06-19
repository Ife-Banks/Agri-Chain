'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Search, Layers3, Truck, AlertTriangle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ProductForm } from '../../components/ProductForm';
import { useProducts } from '../../hooks/useProducts';
import type { ProductFormData } from '../../lib/validations/productSchema';
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

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { products, isLoading, deleteProductAsync } = useProducts();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any>(null);

  const filteredProducts = React.useMemo(
    () =>
      products.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  const handleAddProduct = async (data: ProductFormData) => {
    try {
      toast({ title: 'Product created', description: `${data.title} has been added.`, type: 'success' });
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to create product', type: 'error' });
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct({
      ...product,
      title: product.name,
    });
  };

  const handleUpdateProduct = async (data: ProductFormData) => {
    if (!editingProduct) return;
    try {
      toast({ title: 'Product updated', description: `${data.title} has been updated.`, type: 'success' });
      setEditingProduct(null);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to update product', type: 'error' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete product ${name}?`)) return;
    try {
      await deleteProductAsync(id);
      toast({ title: 'Product deleted', description: `${name} has been removed.`, type: 'success' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to delete product', type: 'error' });
    }
  };

  const stats = [
    { label: 'Active SKUs', value: products.filter((p: any) => p.status === 'Active').length.toString(), icon: Package },
    { label: 'Low stock items', value: products.filter((p: any) => p.stock > 0 && p.stock < 50).length.toString(), icon: AlertTriangle },
    { label: 'Out of stock', value: products.filter((p: any) => p.stock === 0).length.toString(), icon: Truck },
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
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Catalog management</p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50">Products and inventory control</h2>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Keep the catalog current, track stock levels, and publish new items with a cleaner workflow.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="h-11 w-fit">
            <Plus className="h-4 w-4" />
            Add product
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
              <CardTitle>Catalog</CardTitle>
              <CardDescription className="text-zinc-400">Search products, monitor stock, and update availability.</CardDescription>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search product or category"
                className="h-11 border-white/10 bg-white/5 pl-9 text-zinc-100 placeholder:text-zinc-500"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: any) => (
                    <TableRow key={product.id} className="border-white/5">
                      <TableCell className="font-medium text-zinc-50">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="info">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-zinc-300">${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock === 0 ? 'destructive' : product.stock < 50 ? 'warning' : 'success'}>
                          {product.stock} units
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={product.status === 'Active' ? 'success' : product.status === 'Out of Stock' ? 'destructive' : 'secondary'}
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-zinc-300 hover:bg-white/5 hover:text-white"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-white/5">
                    <TableCell colSpan={6} className="py-16 text-center">
                      <p className="text-lg font-medium text-zinc-50">No products found</p>
                      <p className="mt-2 text-sm text-zinc-400">Try a different search term or add a new product.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent title="Add new product">
          <ProductForm onSubmit={handleAddProduct} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent title="Edit product">
          {editingProduct && (
            <ProductForm
              defaultValues={{
                title: editingProduct.title || editingProduct.name,
                description: '',
                price: editingProduct.price,
                kilogram: 1,
                stock: editingProduct.stock,
                condition: 'Fresh',
                isActive: editingProduct.status === 'Active',
              }}
              onSubmit={handleUpdateProduct}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}