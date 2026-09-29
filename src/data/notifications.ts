export interface AtelierNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'drop' | 'workbench' | 'order' | 'announcement';
  read: boolean;
  link?: string;
  badge?: string;
}

export const INITIAL_NOTIFICATIONS: AtelierNotification[] = [
  {
    id: 'notif-1',
    title: 'New Footwear Drop at Atelier',
    message: 'The Sovereign Wholecut Oxford in Hand-Patinated Cognac Box Calf is now available to commission.',
    time: '15m ago',
    type: 'drop',
    read: false,
    link: '/collection',
    badge: 'New Release'
  },
  {
    id: 'notif-2',
    title: 'Workbench Progress Log',
    message: 'Commission #NS-ORD-882190 has advanced to Stage 04: Hand-Burnished Patina & Glacage.',
    time: '2h ago',
    type: 'workbench',
    read: false,
    link: '/track',
    badge: 'Workbench'
  },
  {
    id: 'notif-3',
    title: 'Bespoke Fitting Calendar',
    message: 'Master Nelson has opened 3 exclusive measurement slots for October at the Lagos Atelier.',
    time: '1d ago',
    type: 'announcement',
    read: true,
    link: '/bespoke',
    badge: 'Atelier'
  },
  {
    id: 'notif-4',
    title: 'DHL Express Dispatch Confirmation',
    message: 'DHL Express courier tracking has been assigned to overseas parcel #NS-ORD-519284.',
    time: '2d ago',
    type: 'order',
    read: true,
    link: '/track',
    badge: 'Dispatched'
  }
];
