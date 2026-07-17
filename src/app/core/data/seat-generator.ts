import { SeatBlock ,Seat,TheaterLayoutBlock} from './layout.data';



export function buildBlocks(
  layout: TheaterLayoutBlock[]
): SeatBlock[] {

  return layout.map(block => ({

    id: block.id,

    x: block.x,

    y: block.y,

    rotation: block.rotation,

    rows: block.rows.map(row => ({

      label: row.row,

      seats: row.seats.map(number => {

        const seat: Seat = {

          id: `${row.row}${number}`,

          row: row.row,

          number,

          status: 'available',

          price: 100

        };

        return seat;

      })

    }))

  }));

}