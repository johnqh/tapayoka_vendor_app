import type { ComponentType, SVGProps } from 'react';
import {
  SparklesIcon,
  FireIcon,
  TruckIcon,
  BoltIcon,
  LockClosedIcon,
  ShoppingCartIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';
import type { VendorModelType } from '@sudobility/tapayoka_types';

export const MODEL_TYPE_ICONS: Record<VendorModelType, ComponentType<SVGProps<SVGSVGElement>>> = {
  Washer: SparklesIcon,
  Dryer: FireIcon,
  Parking: TruckIcon,
  Charging: BoltIcon,
  Locker: LockClosedIcon,
  Vending: ShoppingCartIcon,
  'Tourist Binocular': ViewfinderCircleIcon,
};

export const MODEL_TYPE_COLORS: Record<VendorModelType, string> = {
  Washer: '#2196F3',
  Dryer: '#F57C00',
  Parking: '#1A237E',
  Charging: '#00897B',
  Locker: '#616161',
  Vending: '#388E3C',
  'Tourist Binocular': '#6A1B9A',
};
