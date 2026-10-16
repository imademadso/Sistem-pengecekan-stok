import { StockItem } from '../types/stock';

// Data sampel mentah (tidak terurut) untuk simulasi impor stok
export const RAW_SAMPLE_ITEMS: Omit<StockItem, 'isChecked' | 'adminFlagged'>[] = [
  {
    id: '1',
    kodeItem: 'BRG-108',
    namaItem: 'Sepatu Safety Boots Pro Guard Size 42',
    stokPusat: 120,
    stokToko1: 24, // <= 36
    stokToko2: 45,
    stokToko3: 18, // <= 36
  },
  {
    id: '2',
    kodeItem: 'BRG-102',
    namaItem: 'Beras Pandan Wangi Premium 5kg',
    stokPusat: 450,
    stokToko1: 65,
    stokToko2: 32, // <= 36
    stokToko3: 80,
  },
  {
    id: '3',
    kodeItem: 'BRG-115',
    namaItem: 'Minyak Goreng Sawit Pouch 2L',
    stokPusat: 600,
    stokToko1: 110,
    stokToko2: 95,
    stokToko3: 28, // <= 36
  },
  {
    id: '4',
    kodeItem: 'BRG-101',
    namaItem: 'Air Mineral Galon 19 Liter',
    stokPusat: 200,
    stokToko1: 40,
    stokToko2: 35, // <= 36
    stokToko3: 50,
  },
  {
    id: '5',
    kodeItem: 'BRG-120',
    namaItem: 'Kertas HVS A4 75 GSM Rim',
    stokPusat: 350,
    stokToko1: 15, // <= 36
    stokToko2: 20, // <= 36
    stokToko3: 12, // <= 36
  },
  {
    id: '6',
    kodeItem: 'BRG-105',
    namaItem: 'Kopi Bubuk Arabika Robusta Blend 250g',
    stokPusat: 180,
    stokToko1: 54,
    stokToko2: 60,
    stokToko3: 34, // <= 36
  },
  {
    id: '7',
    kodeItem: 'BRG-112',
    namaItem: 'Sabun Cuci Piring Konsentrat 750ml',
    stokPusat: 290,
    stokToko1: 72,
    stokToko2: 30, // <= 36
    stokToko3: 42,
  },
  {
    id: '8',
    kodeItem: 'BRG-103',
    namaItem: 'Gula Pasir Kristal Putih 1kg',
    stokPusat: 500,
    stokToko1: 85,
    stokToko2: 90,
    stokToko3: 75,
  },
  {
    id: '9',
    kodeItem: 'BRG-109',
    namaItem: 'Deterjen Bubuk Anti Bakteri 800g',
    stokPusat: 310,
    stokToko1: 22, // <= 36
    stokToko2: 48,
    stokToko3: 31, // <= 36
  },
  {
    id: '10',
    kodeItem: 'BRG-117',
    namaItem: 'Teh Celup Hitam Premium Box 25s',
    stokPusat: 240,
    stokToko1: 65,
    stokToko2: 50,
    stokToko3: 36, // <= 36 (tepat batas)
  },
  {
    id: '11',
    kodeItem: 'BRG-104',
    namaItem: 'Susu UHT Full Cream 1 Liter',
    stokPusat: 400,
    stokToko1: 30, // <= 36
    stokToko2: 40,
    stokToko3: 25, // <= 36
  },
  {
    id: '12',
    kodeItem: 'BRG-114',
    namaItem: 'Mie Instan Goreng Spesial (Dus 40 pcs)',
    stokPusat: 250,
    stokToko1: 18, // <= 36
    stokToko2: 22, // <= 36
    stokToko3: 15, // <= 36
  },
  {
    id: '13',
    kodeItem: 'BRG-106',
    namaItem: 'Kecap Manis Botol 600ml',
    stokPusat: 210,
    stokToko1: 45,
    stokToko2: 33, // <= 36
    stokToko3: 52,
  },
  {
    id: '14',
    kodeItem: 'BRG-110',
    namaItem: 'Pasta Gigi Fresh Mint 190g',
    stokPusat: 330,
    stokToko1: 60,
    stokToko2: 55,
    stokToko3: 40,
  },
  {
    id: '15',
    kodeItem: 'BRG-107',
    namaItem: 'Saus Sambal Ekstra Pedas 335ml',
    stokPusat: 190,
    stokToko1: 38,
    stokToko2: 29, // <= 36
    stokToko3: 41,
  }
];

// Helper untuk merapikan data dan mengurutkannya secara A-Z berdasarkan Nama Item
export function cleanAndSortItemsAZ(items: StockItem[]): StockItem[] {
  return [...items].sort((a, b) => {
    const nameA = (a.namaItem || '').trim().toLowerCase();
    const nameB = (b.namaItem || '').trim().toLowerCase();
    return nameA.localeCompare(nameB, 'id', { numeric: true, sensitivity: 'base' });
  });
}
