import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Moderator' | 'Farmer';
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  lastLogin: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'Active' | 'Inactive' | 'Out of Stock';
}

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
}

interface AdminState {
  users: User[];
  products: Product[];
  orders: Order[];
  sidebarCollapsed: boolean;
  currentUser: User | null;
  
  // Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  
  toggleSidebar: () => void;
  setCurrentUser: (user: User | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  users: [],
  products: [],
  orders: [],
  sidebarCollapsed: false,
  currentUser: null,
  
  setUsers: (users) => set({ users }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updatedUser) => set((state) => ({
    users: state.users.map((user) => user.id === id ? { ...user, ...updatedUser } : user)
  })),
  deleteUser: (id) => set((state) => ({ users: state.users.filter((user) => user.id !== id) })),
  
  setProducts: (products) => set({ products }),
  addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
  updateProduct: (id, updatedProduct) => set((state) => ({
    products: state.products.map((product) => product.id === id ? { ...product, ...updatedProduct } : product)
  })),
  deleteProduct: (id) => set((state) => ({ products: state.products.filter((product) => product.id !== id) })),
  
  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })),
  updateOrder: (id, updatedOrder) => set((state) => ({
    orders: state.orders.map((order) => order.id === id ? { ...order, ...updatedOrder } : order)
  })),
  deleteOrder: (id) => set((state) => ({ orders: state.orders.filter((order) => order.id !== id) })),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setCurrentUser: (user) => set({ currentUser: user }),
}));
