import { Injectable } from '@angular/core';
import { Seat, SeatBlock } from './test.data';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  constructor() {}

  generateTheater(): SeatBlock[] {
    return [
      this.generateTopLeftLevelOne(),
      this.generateTopCenterLevelone(),
      this.generateTopRightLevelOne(),
      this.generateTopLeftLevelTwo(),
      this.generateTopCenterLevelTwo(),
      this.generateTopRightLevelTwo(),
      this.generateTopLeftLevelThree(),
      this.generateTopCenterLevelThree(),
      this.generateTopRightLevelThree(),
      this.generateTopLeftLevelFour(),
      this.generateTopCenterLevelFour(),
      this.generateTopRightLevelFour(),
      this.generateLeftBottomLevelFive(),
      this.generateRightBottomLevelFive()
    ];
  }

  private LeftTopseatRowsLevelOne = [
    { label: 'A', seats: ['A21', 'A19', 'A17', 'A15', 'A13', 'A11'] },
    { label: 'B', seats: ['B23', 'B21', 'B19', 'B17', 'B15', 'B15', 'B11'] },
    { label: 'C', seats: ['C25', 'C23', 'C21', 'C19', 'C17', 'C15', 'C13', 'C11'] },
    { label: 'D', seats: ['D25', 'D23', 'D21', 'D19', 'D17', 'D15', 'D13', 'D11'] },
    { label: 'E', seats: ['E25', 'E23', 'E21', 'E19', 'E17', 'E15', 'E13', 'E11'] },
       { label: 'F', seats: ['F27','F25', 'F23', 'F21', 'F19', 'F17', 'F15', 'F13', 'F11'] },
    { label: 'G', seats: ['G27', 'G25', 'G23', 'G21', 'G19', 'G17', 'G15', 'G13', 'G11'] },
    { label: 'H', seats: ['H27', 'H25', 'H23', 'H21', 'H19', 'H17', 'H15', 'H13', 'H11'] }
  ];
  private CenterTopseatRowsLevelOne = [
    { label: 'A', seats: [ ] },
    { label: 'B', seats: ['B9', 'B7', 'B5', 'B3', 'B1', 'B2', 'B4','B6','B8','B10'] },
    { label: 'C', seats: ['Cp', 'C7', 'C5', 'C3', 'C1', 'C2', 'C4', 'C6','C8'] },
    { label: 'D', seats: ['D9', 'D7', 'D5', 'D3', 'D1', 'D2', 'D4', 'D6', 'D8', 'D10'] },
    { label: 'E', seats: ['E9', 'E7', 'E5', 'E3', 'E1', 'E2', 'E4', 'E6', 'E8'] },
       { label: 'F', seats: ['F9', 'F7', 'F5', 'F3', 'F1', 'F2', 'F4', 'F6', 'F8', 'F10'] },
    { label: 'G', seats: ['G9', 'G7', 'G5', 'G3', 'G1', 'G2', 'G4', 'G6', 'G8'] },
    { label: 'H', seats: ['H9', 'H7', 'H5', 'H3', 'H1', 'H2', 'H4', 'H6', 'H8', 'H10'] }
  ];
   private RightTopseatRowsLevelOne = [
    { label: 'A', seats: [ 'A10','A12','A14' ,'A16','A18','A20'] },
    { label: 'B', seats: ['B12','B10', 'B12', 'B6', 'B18', 'B20', 'B22', 'B24'] },
    { label: 'C', seats: ['C10', 'C12', 'C14', 'C16', 'C18', 'C20', 'C22'] },
    { label: 'D', seats: ['D12', 'D14', 'D16', 'D18', 'D20', 'D22', 'D24', 'D26'] },
    { label: 'E', seats: ['E10', 'E12', 'E14', 'E16', 'E18', 'E20', 'E22','E24'] },
       { label: 'F', seats: ['F12', 'F14', 'F16', 'F18', 'F20', 'F22', 'F24', 'F26', 'F28'] },
    { label: 'G', seats: ['G10', 'G12', 'G14', 'G16', 'G18', 'G20', 'G22','G24','G26'] },
    { label: 'H', seats: ['H12', 'H14', 'H16', 'H18', 'H20', 'H22', 'H24', 'H26', 'H28'] }
  ];

  private LeftTopseatRowsLevelTwo = [
    { label: 'I', seats: [ 'I27','I25','I23' ,'I16','I18','I20'] },
    { label: 'J', seats: ['J29','J27', 'J25', 'J23', 'J21', 'J19', 'J17', 'J15','J13','J11'] },
    { label: 'K', seats: ['K29', 'K27', 'K25', 'K23', 'K21', 'K19', 'K17','K15','K13','K11'] },
    { label: 'L', seats: ['L29', 'L27', 'L25', 'L23', 'L21', 'L19', 'L17', 'L15','L13','L11'] },
    { label: 'M', seats: ['M29', 'M27', 'M25', 'M23', 'M21', 'M19', 'M17','M15','M13','M11'] },
    { label: 'N', seats: ['N31','N29', 'N27', 'N25', 'N23'  , 'N21', 'N19', 'N17', 'N15', 'N13','N11'] },
    { label: 'O', seats: ['O31', 'O29', 'O27', 'O25', 'O23', 'O21', 'O19','O17','O15','O13','O11'] },
    { label: 'P', seats: ['P31', 'P29', 'P27', 'P25', 'P23', 'P21', 'P19','P17','P15','P13','P11'] }
   ,{ label: 'Q', seats: ['Q31', 'Q29', 'Q27', 'Q25', 'Q23', 'Q21', 'Q19','Q17','Q15','Q13','Q11'] }
  ]
   private LeftTopseatRowsLevelThree = [
    { label: 'R', seats: [ 'R19','R17','R14' ,'R13','R11','R9','R7','R5','R3','R1'] },
  ]

   private CenterTopseatRowsLevelTwo = [
    { label: 'I', seats: [ 'I9','I7','I5' ,'I3','I1','I4','I6','I8'] },
    { label: 'J', seats: ['J9','J7', 'J5', 'J3', 'J1', 'J4', 'J6', 'J8'] },
    { label: 'K', seats: ['K9', 'K7', 'K5', 'K3', 'K1', 'K4', 'K6','K8'] },
    { label: 'L', seats: ['L9', 'L7', 'L5', 'L3', 'L1', 'L4', 'L6', 'L8'] },
    { label: 'M', seats: ['M9', 'M7', 'M5', 'M3', 'M1', 'M4', 'M6','M8'] },
    { label: 'N', seats: ['N9', 'N7', 'N5', 'N3'  , 'N1', 'N4', 'N6', 'N8'] },
    { label: 'O', seats: [ 'O9', 'O7', 'O5', 'O3', 'O1', 'O4','O6','O8'] },
    { label: 'P', seats: [ 'P9', 'P7', 'P5', 'P3', 'P1', 'P4','P6','P8'] }
   ,{ label: 'Q', seats: [ 'Q9', 'Q7', 'Q5', 'Q3', 'Q1', 'Q4','Q6','Q8'] }
  ]
 private CenterTopseatRowsLevelThree = [
  ]
 private RightTopseatRowsLevelTwo = [
    { label: 'I', seats: [ 'I10','I12','I14' ,'I16','I18','I20','I22','I24','I26'] },
    { label: 'J', seats: ['J10','J12', 'J14', 'J16', 'J18', 'J20', 'J22', 'J24','J26' ,'J28'] },
    { label: 'K', seats: ['K10', 'K12', 'K14', 'K16', 'K18', 'K20', 'K22','K24','K26','K28'] },
    { label: 'L', seats: ['L10', 'L12', 'L14', 'L16', 'L18', 'L20', 'L22', 'L24','L26','L28'] },
    { label: 'M', seats: ['M10', 'M12', 'M14', 'M16', 'M18', 'M20', 'M22','M24','M26','M28'] },
    { label: 'N', seats: ['N10','N12', 'N14', 'N16', 'N18'  , 'N20', 'N22', 'N24', 'N26', 'N28','N30'] },
    { label: 'O', seats: ['O10', 'O12', 'O14', 'O16', 'O18', 'O20', 'O22','O24','O26','O28','O30'] },
    { label: 'P', seats: ['P10', 'P12', 'P14', 'P16', 'P18', 'P20', 'P22','P24','P26','P28','P30'] }
   ,{ label: 'Q', seats: ['Q10', 'Q12', 'Q14', 'Q16', 'Q18', 'Q20', 'Q22','Q24','Q26','Q28','Q30'] }
  ]

 private RightTopseatRowsLevelThree = [
    { label: 'R', seats: [ 'R2','R4','R6','R8','R10' ,'R16','R18','R20'] },
  ]

  /////
   private RightBootomseatRowsLevelFour: { label: string; seats: string[] }[] = [
    { label: 'A', seats: ['A10','A8','A12','A14','A16','A18','A20','A22','A24','A26','A28','A30','A32','A34'] },
    { label: 'B', seats: ['B10','B8','B12','B14','B16','B18','B20','B22','B24','B26','B28','B30','B32','B34'] },
    { label: 'C', seats: ['C10','C8','C12','C14','C16','C18','C20','C22','C24','C26','C28','C30','C32','C34'] },
  ];

  // ─── VIP Center Blocks (rows A-C) - PDF: 5,7,3,1,2,4,6 ───
  private CenterBottomseatRowsLevelFour: { label: string; seats: string[] }[] = [
    { label: 'A', seats: ['A5','A7','A3','A1','A2','A4','A6'] },
    { label: 'B', seats: ['B5','B7','B3','B1','B2','B4','B6'] },
    { label: 'C', seats: ['C5','C7','C3','C1','C2','C4','C6'] },
  ];

  // ─── VIP Right Blocks (rows A-C) - PDF: 33,35,31,29,27,25,23,21,19,17,15,13,11,9 ───
  private LeftBottomseatRowsLevelFour: { label: string; seats: string[] }[] = [
    { label: 'A', seats: ['A33','A35','A31','A29','A27','A25','A23','A21','A19','A17','A15','A13','A11','A9'] },
    { label: 'B', seats: ['B33','B35','B31','B29','B27','B25','B23','B21','B19','B17','B15','B13','B11','B9'] },
    { label: 'C', seats: ['C33','C35','C31','C29','C27','C25','C23','C21','C19','C17','C15','C13','C11','C9'] },
  ];

  // ─── Bottom Left (rows D-H) - PDF: even seats 4,2,6,8,10,12,... ───
  private RightBottomRows: { label: string; seats: string[] }[] = [
    { label: 'D', seats: ['D4','D2','D6','D8','D10','D12','D14','D16','D18','D20','D22','D24','D26','D28','D30'] },
    { label: 'E', seats: ['E4','E2','E6','E8','E10','E12','E14','E16','E18','E20','E22','E24','E26','E28','E30'] },
    { label: 'F', seats: ['F4','F2','F6','F8','F10','F12','F14','F16','F18','F20','F22','F24','F26','F28','F30'] },
    { label: 'G', seats: ['G4','G2','G6','G8','G10','G12','G14','G16','G18','G20','G22','G24','G26','G28','G30','G32'] },
    { label: 'H', seats: ['H4','H2','H6','H8','H10','H12','H14','H16','H18','H20','H22','H24','H26','H28','H30','H32'] },
  ];

  // ─── Bottom Right (rows D-H) - PDF: odd seats descending 29,31,27,25,... ───
  private LeftBottomRows: { label: string; seats: string[] }[] = [
    { label: 'D', seats: ['D29','D27','D25','D23','D21','D19','D17','D15','D13','D11','D9','D7','D5','D3','D1'] },
    { label: 'E', seats: ['E29','E27','E25','E23','E21','E19','E17','E15','E13','E11','E9','E7','E5','E3','E1'] },
    { label: 'F', seats: ['F29','F27','F25','F23','F21','F19','F17','F15','F13','F11','F9','F7','F5','F3','F1'] },
    { label: 'G', seats: ['G29','G31','G27','G25','G23','G21','G19','G17','G15','G13','G11','G9','G7','G5','G3','G1'] },
    { label: 'H', seats: ['H29','H31','H27','H25','H23','H21','H19','H17','H15','H13','H11','H9','H7','H5','H3','H1'] },
  ];



  private makeBlock(id: number, translateX: number, translateY: number, rotation: number, rows: { label: string; seats: string[] }[]): SeatBlock {
    return {
      id,
      translateX,
      translateY,
      rotation,
      rows: rows.map(row => ({
        id: this.rowId(row.label),
        label: row.label,
        seats: this.createSeats(row.seats)
      }))
    };
  }

  //////level one
  private generateTopLeftLevelOne(): SeatBlock {
    return this.makeBlock(1, 120, 5, 20, this.LeftTopseatRowsLevelOne);
  }

  private generateTopCenterLevelone(): SeatBlock {
    return this.makeBlock(2, 500, 100, 0, this.CenterTopseatRowsLevelOne);
  }

  private generateTopRightLevelOne(): SeatBlock {
    return this.makeBlock(3, 950, 100, -20, this.RightTopseatRowsLevelOne);
  }

  //////level two
  private generateTopLeftLevelTwo(): SeatBlock {
    return this.makeBlock(4, 120, 350, 20, this.LeftTopseatRowsLevelTwo);
  }

  private generateTopCenterLevelTwo(): SeatBlock {
    return this.makeBlock(2, 500, 450, 0, this.CenterTopseatRowsLevelTwo);
  }

  private generateTopRightLevelTwo(): SeatBlock {
    return this.makeBlock(3, 900, 450, -15, this.RightTopseatRowsLevelTwo);
  }

  //////level three
  private generateTopLeftLevelThree(): SeatBlock {
    return this.makeBlock(9, 30, 700, 20, this.LeftTopseatRowsLevelThree);
  }

  private generateTopCenterLevelThree(): SeatBlock {
    return this.makeBlock(2, 500, 725, 0, this.CenterTopseatRowsLevelThree);
  }

  private generateTopRightLevelThree(): SeatBlock {
    return this.makeBlock(3, 1000, 800, -15, this.RightTopseatRowsLevelThree);
  }

  //////level four
  private generateTopLeftLevelFour(): SeatBlock {
    return this.makeBlock(1, 20, 900, 0, this.LeftBottomseatRowsLevelFour);
  }

  private generateTopCenterLevelFour(): SeatBlock {
    return this.makeBlock(2, 500, 900, 0, this.CenterBottomseatRowsLevelFour);
  }

  private generateTopRightLevelFour(): SeatBlock {
    return this.makeBlock(3, 850, 900, 0, this.RightBootomseatRowsLevelFour);
  }
 private generateLeftBottomLevelFive(): SeatBlock {
    return this.makeBlock(2, 20, 1025, 0, this.LeftBottomRows);
  }

  private generateRightBottomLevelFive(): SeatBlock {
    return this.makeBlock(3, 800, 1025, 0, this.RightBottomRows);
  }




  /**
   * Create even-numbered seats for bottom-left block
   * Pattern: 4,2,6,8,10,12,... up to count
   */
  private createEvenBottomLeft(rowLabel: string, maxSeat: number): Seat[] {
    const numbers: number[] = [4, 2];
    for (let n = 6; n <= maxSeat; n += 2) {
      numbers.push(n);
    }
    return numbers.map((n) => ({
      id: this.seatId(rowLabel, n),
      seatnumber: `${rowLabel}${n}`,
      status: 'available' as const
    }));
  }

  /**
   * Create odd-numbered descending seats for bottom-right block
   * Pattern for D,E,F: 29,27,25,...,1
   * Pattern for G,H: 29,31,27,25,...,1
   */
  private createOddBottomRight(rowLabel: string, has31: boolean): Seat[] {
    const numbers: number[] = [];
    if (has31) {
      numbers.push(29, 31);
    }
    const start = has31 ? 27 : 29;
    for (let n = start; n >= 1; n -= 2) {
      numbers.push(n);
    }
    return numbers.map((n) => ({
      id: this.seatId(rowLabel, n),
      seatnumber: `${rowLabel}${n}`,
      status: 'available' as const
    }));
  }

  /** VIP price for rows A, B, C */
  private readonly VIP_PRICE = 2500;
  /** Regular price for all other rows */
  private readonly REGULAR_PRICE = 1500;

  private isVipRow(label: string): boolean {
    return ['A', 'B', 'C'].includes(label);
  }

  private createSeats(seatNumbers: string[]): Seat[] {
    return seatNumbers.map((sn) => ({
      id: this.seatId(sn.charAt(0), parseInt(sn.substring(1))),
      seatnumber: sn,
      status: 'available' as const,
      price: this.isVipRow(sn.charAt(0)) ? this.VIP_PRICE : this.REGULAR_PRICE
    }));
  }

  private seatId(rowLabel: string, number: number): number {
    return rowLabel.charCodeAt(0) * 1000 + number;
  }

  private rowId(rowLabel: string): number {
    return rowLabel.charCodeAt(0) * 100;
  }
}