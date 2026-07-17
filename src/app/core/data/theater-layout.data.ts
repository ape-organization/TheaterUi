import type { SeatMapResponse } from '../models/api.models';

export const theaterSeatLayout: SeatMapResponse = {
  eventId: 1,
  rows: [
    {
      name: 'A',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 1, seatNumber: 'A1', row: 'A', status: 'available', price: 1500 },
            { id: 2, seatNumber: 'A2', row: 'A', status: 'available', price: 1500 },
            { id: 3, seatNumber: 'A3', row: 'A', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Center section',
          seats: [
            { id: 4, seatNumber: 'A4', row: 'A', status: 'available', price: 1500 },
            { id: 5, seatNumber: 'A5', row: 'A', status: 'available', price: 1500 },
            { id: 6, seatNumber: 'A6', row: 'A', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 7, seatNumber: 'A7', row: 'A', status: 'available', price: 1500 },
            { id: 8, seatNumber: 'A8', row: 'A', status: 'available', price: 1500 },
            { id: 9, seatNumber: 'A9', row: 'A', status: 'available', price: 1500 }
          ]
        }
      ]
    },
    {
      name: 'B',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 10, seatNumber: 'B1', row: 'B', status: 'available', price: 1500 },
            { id: 11, seatNumber: 'B2', row: 'B', status: 'available', price: 1500 },
            { id: 12, seatNumber: 'B3', row: 'B', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Center section',
          seats: [
            { id: 13, seatNumber: 'B4', row: 'B', status: 'available', price: 1500 },
            { id: 14, seatNumber: 'B5', row: 'B', status: 'available', price: 1500 },
            { id: 15, seatNumber: 'B6', row: 'B', status: 'available', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 16, seatNumber: 'B7', row: 'B', status: 'available', price: 1500 },
            { id: 17, seatNumber: 'B8', row: 'B', status: 'reserved', price: 1500 },
            { id: 18, seatNumber: 'B9', row: 'B', status: 'available', price: 1500 }
          ]
        }
      ]
    },
    {
      name: 'C',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 19, seatNumber: 'C1', row: 'C', status: 'available', price: 1500 },
            { id: 20, seatNumber: 'C2', row: 'C', status: 'available', price: 1500 },
            { id: 21, seatNumber: 'C3', row: 'C', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Center section',
          seats: [
            { id: 22, seatNumber: 'C4', row: 'C', status: 'available', price: 1500 },
            { id: 23, seatNumber: 'C5', row: 'C', status: 'available', price: 1500 },
            { id: 24, seatNumber: 'C6', row: 'C', status: 'available', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 25, seatNumber: 'C7', row: 'C', status: 'available', price: 1500 },
            { id: 26, seatNumber: 'C8', row: 'C', status: 'reserved', price: 1500 },
            { id: 27, seatNumber: 'C9', row: 'C', status: 'available', price: 1500 }
          ]
        }
      ]
    },
    {
      name: 'D',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 28, seatNumber: 'D1', row: 'D', status: 'available', price: 1500 },
            { id: 29, seatNumber: 'D2', row: 'D', status: 'available', price: 1500 },
            { id: 30, seatNumber: 'D3', row: 'D', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 31, seatNumber: 'D4', row: 'D', status: 'available', price: 1500 },
            { id: 32, seatNumber: 'D5', row: 'D', status: 'available', price: 1500 },
            { id: 33, seatNumber: 'D6', row: 'D', status: 'available', price: 1500 }
          ]
        }
      ]
    },
    {
      name: 'E',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 34, seatNumber: 'E1', row: 'E', status: 'available', price: 1500 },
            { id: 35, seatNumber: 'E2', row: 'E', status: 'available', price: 1500 },
            { id: 36, seatNumber: 'E3', row: 'E', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 37, seatNumber: 'E4', row: 'E', status: 'available', price: 1500 },
            { id: 38, seatNumber: 'E5', row: 'E', status: 'available', price: 1500 },
            { id: 39, seatNumber: 'E6', row: 'E', status: 'available', price: 1500 }
          ]
        }
      ]
    },
    {
      name: 'F',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 40, seatNumber: 'F1', row: 'F', status: 'available', price: 1500 },
            { id: 41, seatNumber: 'F2', row: 'F', status: 'available', price: 1500 },
            { id: 42, seatNumber: 'F3', row: 'F', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 43, seatNumber: 'F4', row: 'F', status: 'available', price: 1500 },
            { id: 44, seatNumber: 'F5', row: 'F', status: 'available', price: 1500 },
            { id: 45, seatNumber: 'F6', row: 'F', status: 'available', price: 1500 }
          ]
        }
      ]
    },
    {
      name: 'G',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 46, seatNumber: 'G1', row: 'G', status: 'available', price: 1500 },
            { id: 47, seatNumber: 'G2', row: 'G', status: 'available', price: 1500 },
            { id: 48, seatNumber: 'G3', row: 'G', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 49, seatNumber: 'G4', row: 'G', status: 'available', price: 1500 },
            { id: 50, seatNumber: 'G5', row: 'G', status: 'available', price: 1500 },
            { id: 51, seatNumber: 'G6', row: 'G', status: 'available', price: 1500 }
          ]
        }
      ]
    },
    {
      name: 'H',
      sections: [
        {
          name: 'Left section',
          seats: [
            { id: 52, seatNumber: 'H1', row: 'H', status: 'available', price: 1500 },
            { id: 53, seatNumber: 'H2', row: 'H', status: 'available', price: 1500 },
            { id: 54, seatNumber: 'H3', row: 'H', status: 'reserved', price: 1500 }
          ]
        },
        {
          name: 'Right section',
          seats: [
            { id: 55, seatNumber: 'H4', row: 'H', status: 'available', price: 1500 },
            { id: 56, seatNumber: 'H5', row: 'H', status: 'available', price: 1500 },
            { id: 57, seatNumber: 'H6', row: 'H', status: 'available', price: 1500 }
          ]
        }
      ]
    }
  ]
};
//////

