export interface Clinic {
  id: string;
  name: string;
  specialty: 'Gynecology' | 'Fertility' | 'PCOS' | 'Maternity' | 'Menopause' | 'General';
  distanceKm: number;
  nextAvailability: string;
  address: string;
  phone: string;
  acceptsNewPatients: boolean;
}

export const clinics: Clinic[] = [
  {
    id: 'c1',
    name: 'Asha Women’s Health Clinic',
    specialty: 'Gynecology',
    distanceKm: 1.2,
    nextAvailability: 'Tomorrow, 10:30 AM',
    address: '14 Garden Road, Bengaluru',
    phone: '+91 80 2345 6789',
    acceptsNewPatients: true,
  },
  {
    id: 'c2',
    name: 'Tara Fertility Centre',
    specialty: 'Fertility',
    distanceKm: 3.8,
    nextAvailability: 'Thu, 2:00 PM',
    address: '88 MG Road, Bengaluru',
    phone: '+91 80 2456 7890',
    acceptsNewPatients: true,
  },
  {
    id: 'c3',
    name: 'Prerna PCOS Care',
    specialty: 'PCOS',
    distanceKm: 5.1,
    nextAvailability: 'Mon, 11:00 AM',
    address: '5 Indiranagar, Bengaluru',
    phone: '+91 80 2567 8901',
    acceptsNewPatients: true,
  },
  {
    id: 'c4',
    name: 'Sukoon Maternity Hospital',
    specialty: 'Maternity',
    distanceKm: 6.4,
    nextAvailability: 'Fri, 9:00 AM',
    address: '22 Koramangala, Bengaluru',
    phone: '+91 80 2678 9012',
    acceptsNewPatients: false,
  },
  {
    id: 'c5',
    name: 'Sahayata Menopause Clinic',
    specialty: 'Menopause',
    distanceKm: 4.2,
    nextAvailability: 'Wed, 3:30 PM',
    address: '9 Jayanagar, Bengaluru',
    phone: '+91 80 2789 0123',
    acceptsNewPatients: true,
  },
];
