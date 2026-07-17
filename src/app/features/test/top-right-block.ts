/* import { SeatBlock } from './test.data';

// Top right curved block - even seats
// PDF order (left to right): 10,8,12,14,16,18,20,22,24,26,28,30,32,34
export const TOP_RIGHT: SeatBlock = {

    id: 'TOP_RIGHT',

  
   x:120,

y:170,
rotation: 0,

    rows: [
        {
            label: 'A',
            offset: 0,
            seats: [
                { id: 'A10', row: 'A', number: 10, status: 'available', price: 150 },
                { id: 'A8', row: 'A', number: 8, status: 'available', price: 150 },
                ...Array.from({ length: 12 }, (_, i) => ({
                    id: `A${12 + i * 2}` as const,
                    row: 'A' as const,
                    number: 12 + i * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        },
        {
            label: 'B',
            offset: 4,
            seats: [
                { id: 'B10', row: 'B', number: 10, status: 'available', price: 150 },
                { id: 'B8', row: 'B', number: 8, status: 'available', price: 150 },
                ...Array.from({ length: 12 }, (_, i) => ({
                    id: `B${12 + i * 2}` as const,
                    row: 'B' as const,
                    number: 12 + i * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        },
        {
            label: 'C',
            offset: 8,
            seats: [
                { id: 'C10', row: 'C', number: 10, status: 'available', price: 150 },
                { id: 'C8', row: 'C', number: 8, status: 'available', price: 150 },
                ...Array.from({ length: 12 }, (_, i) => ({
                    id: `C${12 + i * 2}` as const,
                    row: 'C' as const,
                    number: 12 + i * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        }
    ]

};
 */