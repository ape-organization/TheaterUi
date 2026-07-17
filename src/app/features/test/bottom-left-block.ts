/* import { SeatBlock } from './test.data';

// Bottom left curved block - odd seat numbers descending
// D: 29,27,25,...,1 (15 seats)
// E: 29,27,25,...,1 (15 seats)
// F: 29,27,25,...,1 (15 seats)
// G: 29,31,27,25,...,1 (16 seats)
// H: 29,31,27,25,...,1 (16 seats)
export const BOTTOM_LEFT: SeatBlock = {

    id: 'BOTTOM_LEFT',

  
x:120,

y:170,
rotation: 12,
    rows: [
        {
            label: 'D',
            offset: 0,
            seats: generateOddSeatsDesc('D', 29, 1)
        },
        {
            label: 'E',
            offset: 6,
            seats: generateOddSeatsDesc('E', 29, 1)
        },
        {
            label: 'F',
            offset: 12,
            seats: generateOddSeatsDesc('F', 29, 1)
        },
        {
            label: 'G',
            offset: 18,
            seats: [
                { id: 'G29', row: 'G', number: 29, status: 'available', price: 150 },
                { id: 'G31', row: 'G', number: 31, status: 'available', price: 150 },
                ...generateOddSeatsDescInner('G', 27, 1)
            ]
        },
        {
            label: 'H',
            offset: 24,
            seats: [
                { id: 'H29', row: 'H', number: 29, status: 'available', price: 150 },
                { id: 'H31', row: 'H', number: 31, status: 'available', price: 150 },
                ...generateOddSeatsDescInner('H', 27, 1)
            ]
        }
    ]

};

function generateOddSeatsDesc(row: string, from: number, to: number) {
    const seats: { id: string; row: string; number: number; status: 'available'; price: number }[] = [];
    for (let n = from; n >= to; n -= 2) {
        seats.push({ id: `${row}${n}`, row, number: n, status: 'available', price: 150 });
    }
    return seats;
}

function generateOddSeatsDescInner(row: string, from: number, to: number) {
    const seats: { id: string; row: string; number: number; status: 'available'; price: number }[] = [];
    for (let n = from; n >= to; n -= 2) {
        seats.push({ id: `${row}${n}`, row, number: n, status: 'available', price: 150 });
    }
    return seats;
} */