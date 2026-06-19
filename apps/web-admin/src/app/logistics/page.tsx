'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Package,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  ChevronRight,
  X,
  Save,
  Phone,
  User,
  Navigation,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Pagination } from '../../components/ui/pagination';
import { Loader2 } from 'lucide-react';
import { useDrivers, useVehicles, useBatches } from '../../hooks/useLogistics';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

type DriverStatus = 'available' | 'in_transit' | 'offline';
type VehicleStatus = 'active' | 'maintenance' | 'inactive';
type BatchStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';

interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: DriverStatus;
  totalDeliveries: number;
  rating: number;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacity: string;
  status: VehicleStatus;
  driver: string;
}

interface DeliveryBatch {
  id: string;
  orderId: string;
  driver: string;
  vehicle: string;
  status: BatchStatus;
  startedAt: string;
  deliveredAt?: string;
  recipient: string;
  address: string;
}

const mockDrivers: Driver[] = [
  { id: '1', name: 'Chidi Okonkwo', phone: '+234 803 456 1111', vehicle: 'Truck - ABC 123 XY', status: 'in_transit', totalDeliveries: 234, rating: 4.8 },
  { id: '2', name: 'Emeka Nwosu', phone: '+234 803 456 2222', vehicle: 'Van - DEF 456 GH', status: 'available', totalDeliveries: 189, rating: 4.6 },
  { id: '3', name: 'Taiwo Williams', phone: '+234 803 456 3333', vehicle: 'Truck - GHI 789 JK', status: 'offline', totalDeliveries: 312, rating: 4.9 },
  { id: '4', name: 'Kunle Adeyemi', phone: '+234 803 456 4444', vehicle: 'Van - JKL 012 LM', status: 'available', totalDeliveries: 145, rating: 4.7 },
];

const mockVehicles: Vehicle[] = [
  { id: '1', plateNumber: 'ABC 123 XY', type: 'Truck', capacity: '2 tons', status: 'active', driver: 'Chidi Okonkwo' },
  { id: '2', plateNumber: 'DEF 456 GH', type: 'Van', capacity: '500 kg', status: 'active', driver: 'Emeka Nwosu' },
  { id: '3', plateNumber: 'GHI 789 JK', type: 'Truck', capacity: '3 tons', status: 'maintenance', driver: 'Taiwo Williams' },
  { id: '4', plateNumber: 'JKL 012 LM', type: 'Van', capacity: '500 kg', status: 'inactive', driver: 'Kunle Adeyemi' },
];

const mockBatches: DeliveryBatch[] = [
  { id: 'b1', orderId: 'ORD-7821', driver: 'Chidi Okonkwo', vehicle: 'ABC 123 XY', status: 'in_transit', startedAt: '2026-06-18T08:00:00', recipient: 'Amina Bello', address: '15 Adeola Odeku, VI, Lagos' },
  { id: 'b2', orderId: 'ORD-7820', driver: 'Emeka Nwosu', vehicle: 'DEF 456 GH', status: 'assigned', startedAt: '2026-06-18T09:30:00', recipient: 'Tunde Okafor', address: '42 Bode Thomas, Surulere, Lagos' },
  { id: 'b3', orderId: 'ORD-7819', driver: 'Chidi Okonkwo', vehicle: 'ABC 123 XY', status: 'delivered', startedAt: '2026-06-17T14:00:00', deliveredAt: '2026-06-17T16:30:00', recipient: 'Grace Mensah', address: '8 Wuse Zone 5, Abuja' },
  { id: 'b4', orderId: 'ORD-7818', driver: 'Emeka Nwosu', vehicle: 'DEF 456 GH', status: 'delivered', startedAt: '2026-06-16T10:00:00', deliveredAt: '2026-06-16T12:45:00', recipient: 'Ibrahim Yusuf', address: '23 Maitama, Abuja' },
];

const driverStatusConfig: Record<DriverStatus, { bg: string; text: string }> = {
  available: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  in_transit: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  offline: { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

const vehicleStatusConfig: Record<VehicleStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  maintenance: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  inactive: { bg: 'bg-zinc-500/10', text: 'text-zinc-400' },
};

const batchStatusConfig: Record<BatchStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  pending: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', icon: <Clock className="h-4 w-4" /> },
  assigned: { bg: 'bg-blue-500/10', text: 'text-blue-400', icon: <User className="h-4 w-4" /> },
  in_transit: { bg: 'bg-purple-500/10', text: 'text-purple-400', icon: <Navigation className="h-4 w-4" /> },
  delivered: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: <CheckCircle className="h-4 w-4" /> },
  failed: { bg: 'bg-red-500/10', text: 'text-red-400', icon: <AlertCircle className="h-4 w-4" /> },
};

type Tab = 'drivers' | 'vehicles' | 'batches';

export default function LogisticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('drivers');
  const [drivers, setDrivers] = useState(mockDrivers);
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [batches, setBatches] = useState(mockBatches);
  const [useApi, setUseApi] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [driversPage, setDriversPage] = useState(1);
  const [vehiclesPage, setVehiclesPage] = useState(1);
  const [batchesPage, setBatchesPage] = useState(1);

  const { drivers: apiDrivers, total: driversTotal, totalPages: driversTotalPages, isLoading: driversLoading } = useDrivers({
    page: driversPage,
    limit: pageSize,
  });
  const { vehicles: apiVehicles, total: vehiclesTotal, totalPages: vehiclesTotalPages, isLoading: vehiclesLoading } = useVehicles({
    page: vehiclesPage,
    limit: pageSize,
  });
  const { batches: apiBatches, total: batchesTotal, totalPages: batchesTotalPages, isLoading: batchesLoading } = useBatches({
    page: batchesPage,
    limit: pageSize,
  });

  useEffect(() => {
    if (useApi) {
      if (apiDrivers.length > 0) setDrivers(apiDrivers);
      if (apiVehicles.length > 0) setVehicles(apiVehicles);
      if (apiBatches.length > 0) setBatches(apiBatches);
    } else {
      setDrivers(mockDrivers);
      setVehicles(mockVehicles);
      setBatches(mockBatches);
    }
  }, [apiDrivers, apiVehicles, apiBatches, useApi]);

  const currentPage = activeTab === 'drivers' ? driversPage : activeTab === 'vehicles' ? vehiclesPage : batchesPage;
  const setCurrentPage = activeTab === 'drivers' ? setDriversPage : activeTab === 'vehicles' ? setVehiclesPage : setBatchesPage;
  const currentTotal = activeTab === 'drivers' ? driversTotal : activeTab === 'vehicles' ? vehiclesTotal : batchesTotal;
  const currentTotalPages = activeTab === 'drivers' ? driversTotalPages : activeTab === 'vehicles' ? vehiclesTotalPages : batchesTotalPages;
  const isLoading = activeTab === 'drivers' ? driversLoading : activeTab === 'vehicles' ? vehiclesLoading : batchesLoading;

  return (
    <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
      <motion.section variants={item}>
        <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
          <a href="/" className="hover:text-emerald-400">Dashboard</a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-zinc-50">Logistics</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-50">Logistics</h1>
            <p className="mt-1 text-sm text-zinc-400">Manage drivers, vehicles, and delivery batches</p>
          </div>
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
        </div>
      </motion.section>

      <motion.section variants={item}>
        <Card className="border-white/5 bg-white/5 text-zinc-50 shadow-soft backdrop-blur overflow-hidden">
          <div className="flex border-b border-white/10">
            {[
              { id: 'drivers' as Tab, label: 'Drivers', icon: User },
              { id: 'vehicles' as Tab, label: 'Vehicles', icon: Truck },
              { id: 'batches' as Tab, label: 'Delivery Batches', icon: Package },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'border-b-2 border-emerald-500 text-emerald-400 bg-emerald-500/5'
                    : 'text-zinc-400 hover:text-zinc-50 hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4">
            {isLoading && useApi ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              </div>
            ) : (
              <>
                {activeTab === 'drivers' && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {drivers.map((driver) => {
                      const config = driverStatusConfig[driver.status];
                      return (
                        <div key={driver.id} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                          <div className="flex items-start justify-between">
                            <Avatar className="h-12 w-12 bg-emerald-500/10 text-emerald-400">
                              <AvatarFallback>{driver.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
                              {driver.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="font-semibold text-zinc-50">{driver.name}</p>
                            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-400">
                              <Phone className="h-3 w-3" /> {driver.phone}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">{driver.vehicle}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                            <span className="text-xs text-zinc-400">{driver.totalDeliveries} deliveries</span>
                            <span className="text-xs text-amber-400">★ {driver.rating}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'vehicles' && (
                  <div className="space-y-3">
                    {vehicles.map((vehicle) => {
                      const config = vehicleStatusConfig[vehicle.status];
                      return (
                        <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                              <Truck className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-50">{vehicle.plateNumber}</p>
                              <p className="mt-1 text-xs text-zinc-400">{vehicle.type} · {vehicle.capacity}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-zinc-400">Driver: {vehicle.driver}</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
                              {vehicle.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'batches' && (
                  <div className="space-y-3">
                    {batches.map((batch) => {
                      const config = batchStatusConfig[batch.status];
                      return (
                        <div key={batch.id} className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-50">{batch.orderId}</span>
                                <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
                                  {config.icon}
                                  <span className="ml-1 capitalize">{batch.status.replace('_', ' ')}</span>
                                </span>
                              </div>
                              <div className="mt-2 flex items-center gap-4 text-xs text-zinc-400">
                                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {batch.driver}</span>
                                <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> {batch.vehicle}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-zinc-50">{batch.recipient}</p>
                              <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                                <MapPin className="h-3 w-3" /> {batch.address}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-xs text-zinc-500">
                            <span>Started: {new Date(batch.startedAt).toLocaleString()}</span>
                            {batch.deliveredAt && <span>Delivered: {new Date(batch.deliveredAt).toLocaleString()}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {useApi && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={currentTotalPages}
                      total={currentTotal}
                      pageSize={pageSize}
                      onPageChange={setCurrentPage}
                      onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </motion.section>
    </motion.div>
  );
}