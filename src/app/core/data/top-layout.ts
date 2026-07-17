import { TheaterLayoutBlock } from './layout.data';

export const TOP_LAYOUT: TheaterLayoutBlock[] = [

{
    id:'TOP_LEFT',

    x:70,

    y:80,

    rotation:-16,

    rows:[

        {row:'A',seats:[8,10,12,14,16,18,20,22,24,26,28,30,32,34]},

        {row:'B',seats:[8,10,12,14,16,18,20,22,24,26,28,30,32,34]},

        {row:'C',seats:[8,10,12,14,16,18,20,22,24,26,28,30,32,34]}

    ]
},

{
    id:'TOP_CENTER',

    x:440,

    y:95,

    rotation:0,

    rows:[

        {row:'A',seats:[7,5,3,1,2,4,6]},

        {row:'B',seats:[7,5,3,1,2,4,6]},

        {row:'C',seats:[7,5,3,1,2,4,6]}

    ]
},

{
    id:'TOP_RIGHT',

    x:710,

    y:80,

    rotation:16,

    rows:[

        {row:'A',seats:[35,33,31,29,27,25,23,21,19,17,15,13,11,9]},

        {row:'B',seats:[35,33,31,29,27,25,23,21,19,17,15,13,11,9]},

        {row:'C',seats:[35,33,31,29,27,25,23,21,19,17,15,13,11,9]}

    ]
}

];