/* import { SeatBlock } from './test.data';

// Bottom right curved block - even seat numbers
// D: 4,2,6,8,10,12,14,16,18,20,22,24,26,28,30 (15 seats)
// E: 4,2,6,8,10,12,14,16,18,20,22,24,26,28,30 (15 seats)
// F: 4,2,6,8,10,12,14,16,18,20,22,24,26,28,30 (15 seats)
// G: 4,2,6,8,10,12,14,16,18,20,22,24,26,28,30,32 (16 seats)
// H: 4,2,6,8,10,12,14,16,18,20,22,24,26,28,30,32 (16 seats)
export const BOTTOM_RIGHT: SeatBlock = {

    id: 'BOTTOM_RIGHT',

  
x:120,

y:170,
rotation: -12,
    rows: [
        {
            label: 'D',
            offset: 0,
            seats: [
                { id: 'D4', row: 'D', number: 4, status: 'available', price: 150 },
                { id: 'D2', row: 'D', number: 2, status: 'available', price: 150 },
                ...Array.from({ length: 13 }, (_, j) => ({
                    id: `D${6 + j * 2}` as const,
                    row: 'D' as const,
                    number: 6 + j * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        },
        {
            label: 'E',
            offset: 6,
            seats: [
                { id: 'E4', row: 'E', number: 4, status: 'available', price: 150 },
                { id: 'E2', row: 'E', number: 2, status: 'available', price: 150 },
                ...Array.from({ length: 13 }, (_, j) => ({
                    id: `E${6 + j * 2}` as const,
                    row: 'E' as const,
                    number: 6 + j * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        },
        {
            label: 'F',
            offset: 12,
            seats: [
                { id: 'F4', row: 'F', number: 4, status: 'available', price: 150 },
                { id: 'F2', row: 'F', number: 2, status: 'available', price: 150 },
                ...Array.from({ length: 13 }, (_, j) => ({
                    id: `F${6 + j * 2}` as const,
                    row: 'F' as const,
                    number: 6 + j * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        },
        {
            label: 'G',
            offset: 18,
            seats: [
                { id: 'G4', row: 'G', number: 4, status: 'available', price: 150 },
                { id: 'G2', row: 'G', number: 2, status: 'available', price: 150 },
                ...Array.from({ length: 14 }, (_, j) => ({
                    id: `G${6 + j * 2}` as const,
                    row: 'G' as const,
                    number: 6 + j * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        },
        {
            label: 'H',
            offset: 24,
            seats: [
                { id: 'H4', row: 'H', number: 4, status: 'available', price: 150 },
                { id: 'H2', row: 'H', number: 2, status: 'available', price: 150 },
                ...Array.from({ length: 14 }, (_, j) => ({
                    id: `H${6 + j * 2}` as const,
                    row: 'H' as const,
                    number: 6 + j * 2,
                    status: 'available' as const,
                    price: 150
                }))
            ]
        }
    ]

}; */