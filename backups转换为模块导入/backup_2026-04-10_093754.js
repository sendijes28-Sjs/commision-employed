
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  console.log('🌱 Seeding exported data...');

  // Seed Products
  if (648 > 0) {
    const pData = [
  {
    "id": 1,
    "sku": "YN 1217 ( 5 MM )",
    "name": "SPC 5 MM",
    "bottom_price": 369380
  },
  {
    "id": 2,
    "sku": "YN 1216 (5 MM)",
    "name": "SPC 5 MM",
    "bottom_price": 369380
  },
  {
    "id": 3,
    "sku": "XK7094-302 UK 2,95 M",
    "name": "PVC SEKAT RUANGAN DUA SISI UK 2,95 M",
    "bottom_price": 308200
  },
  {
    "id": 4,
    "sku": "WPC OUTDOOR AT-TEAK",
    "name": "WPC PANEL OUTDOOR TEAK TUNGGAL (ISI 5 BTG)",
    "bottom_price": 222824
  },
  {
    "id": 5,
    "sku": "WPC OUTDOOR AT-RED",
    "name": "WPC PANEL OUTDOOR RED TUNGGAL (ISI 5 BTG)",
    "bottom_price": 222824
  },
  {
    "id": 6,
    "sku": "WPC OUTDOOR AT-LIGHT GREY",
    "name": "WPC PANEL OUTDOOR LIGHT GREY TUNGGAL (ISI 5 BTG)",
    "bottom_price": 222824
  },
  {
    "id": 7,
    "sku": "WPC OUTDOOR AT-LIGHT COFFEE",
    "name": "WPC PANEL OUTDOOR LIGHT COFFEE TUNGGAL ( ISI 5 BTG)",
    "bottom_price": 222824
  },
  {
    "id": 8,
    "sku": "WPC OUTDOOR AT-BLACK",
    "name": "WPC PANEL OUTDOOR BLACK TUNGGAL (ISI 5 BTG)",
    "bottom_price": 222824
  },
  {
    "id": 9,
    "sku": "WPC GBB 121 (ISI 15 BTG)",
    "name": "WPC PANEL 3STRIP",
    "bottom_price": 81696
  },
  {
    "id": 10,
    "sku": "WPC GBB 01 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 11,
    "sku": "WPC GBB 02 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 12,
    "sku": "WPC GBB 05 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 13,
    "sku": "WPC GBB 08 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 14,
    "sku": "WPC GBB 111 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 15,
    "sku": "WPC GBB 119 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 16,
    "sku": "WPC GbB 33 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 17,
    "sku": "WPC GBB 34 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 18,
    "sku": "WPC GBB 35 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 19,
    "sku": "WPC GBB 37 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 20,
    "sku": "WPC GBB 57 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 21,
    "sku": "WPC GBB 82 (ISI 15 BTG)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 77096
  },
  {
    "id": 22,
    "sku": "WPC GBB 01 (1 METER)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 23,
    "sku": "WPC GBB 02 (1 METER)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 24,
    "sku": "WPC GBB 05 ( 1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 25,
    "sku": "WPC GBB 08 ( 1meter )",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 26,
    "sku": "WPC GBB 111 (1 METER)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 27,
    "sku": "WPC GBB 119 (1 METER)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 28,
    "sku": "WPC GBB 121 ( 1meter )",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 29,
    "sku": "WPC GBB 33 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 30,
    "sku": "WPC GBB 34 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 31,
    "sku": "WPC GBB 35 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 32,
    "sku": "WPC GBB 37 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 33,
    "sku": "WPC GBB 57 (1M)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 34,
    "sku": "WPC GBB 82 (1M)",
    "name": "WPC PANEL 3 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 35,
    "sku": "WPC G8Y 47 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 36,
    "sku": "WPC G8Y 47 (1meter)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 37,
    "sku": "WPC G8Y 34",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 38,
    "sku": "WPC G8Y 31",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 39,
    "sku": "WPC G8Y 26",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 40,
    "sku": "WPC G8Y 24 (1 METER)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 41,
    "sku": "WPC G8Y 24",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 42,
    "sku": "WPC G8Y 15 (1 METER)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 43,
    "sku": "WPC G8Y 15",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 44,
    "sku": "WPC G8Y 121 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 45,
    "sku": "WPC G8Y 121 (1 METER)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 46,
    "sku": "WPC G8Y 114 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 47,
    "sku": "WPC G8Y 114 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 48,
    "sku": "WPC G8Y 11 (1 METER)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 49,
    "sku": "WPC G8Y 11",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 50,
    "sku": "WPC G8Y 106 (NEW) (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 51,
    "sku": "WPC G8Y 106 (NEW) - (1M)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 52,
    "sku": "WPC G8Y 106 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 53,
    "sku": "WPC G8Y 106",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 54,
    "sku": "WPC G8Y 1024",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 55,
    "sku": "WPC G8Y 102 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP ABU-ABU TUA GLITIR",
    "bottom_price": 81696
  },
  {
    "id": 56,
    "sku": "WPC G8Y 102 ( 1meter )",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 57,
    "sku": "WPC G8Y 101 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 58,
    "sku": "WPC G8Y 101 ( 1meter )",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 59,
    "sku": "WPC G8Y 09 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 60,
    "sku": "WPC G8Y 09 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 61,
    "sku": "WPC G8Y 08 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 62,
    "sku": "WPC G8Y 08 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 63,
    "sku": "WPC G8Y 07 (1METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 64,
    "sku": "WPC G8Y 07",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 65,
    "sku": "WPC G8Y 06 (1M)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 66,
    "sku": "WPC G8Y 06",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 67,
    "sku": "WPC G8Y 05 (1METER)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 68,
    "sku": "WPC G8Y 04 (ISI 10 BTG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 69,
    "sku": "WPC G8Y 04 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 70,
    "sku": "WPC G8Y 03 (1METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 71,
    "sku": "WPC G8Y 03",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 72,
    "sku": "WPC G8Y 02 (1M)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 73,
    "sku": "WPC G8Y 02",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 74,
    "sku": "WPC G8Y 01 (1METER)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 75,
    "sku": "WPC G8Y 01",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 76,
    "sku": "WPC G 01 (10 BATANG)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 277053
  },
  {
    "id": 77,
    "sku": "WPC CY - Y 06",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 78,
    "sku": "WPC CY 01 (ISI 20 BTG)",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 79,
    "sku": "WPC CY 01-2",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 80,
    "sku": "WPC CY 02 (ISI 20 BTG)",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 81,
    "sku": "WPC CY 03 (ISI 20 BTG)",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 82,
    "sku": "WPC CY 06 (ISI 20 BTG)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 83,
    "sku": "WPC CY 110 (ISI 20 BTG)",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 84,
    "sku": "WPC CY 113 (ISI 20 BTG)",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 85,
    "sku": "WPC CY 122",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 86,
    "sku": "WPC CY 124",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 87,
    "sku": "WPC CY 37",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 88,
    "sku": "WPC CY 44",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 89,
    "sku": "WPC CY 50",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 90,
    "sku": "WPC CY 59",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 91,
    "sku": "WPC CY 64",
    "name": "WPC PANEL",
    "bottom_price": 81696
  },
  {
    "id": 92,
    "sku": "WPC CY - Y 06 (1meter)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 93,
    "sku": "WPC CY 01 (1meter)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 94,
    "sku": "WPC CY 01-2 (1 METER)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 95,
    "sku": "WPC CY 02 (1M)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 96,
    "sku": "WPC CY 02-59 (1M)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 97,
    "sku": "WPC CY 03 (1M)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 98,
    "sku": "WPC CY 05-17 (1M)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 99,
    "sku": "WPC CY 06 (1 METER)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 100,
    "sku": "WPC CY 06-10 (1M)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 101,
    "sku": "WPC cy 10-9 (1m)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 102,
    "sku": "WPC CY 110 (1METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 103,
    "sku": "WPC CY 113 ( 1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 104,
    "sku": "WPC CY 122 (1 meter)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 105,
    "sku": "WPC CY 124 ( 1Meter )",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 106,
    "sku": "WPC cy 127 (1 meter)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 107,
    "sku": "WPC CY 37 (1 METER)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 108,
    "sku": "WPC CY 44 (1meter)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 109,
    "sku": "WPC CY 50 (1 METER)",
    "name": "WPC PANEL 5 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 110,
    "sku": "WPC CY 59 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 111,
    "sku": "WPC CY 64 (1 METER )",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 112,
    "sku": "WPC AT - PS 4 (ISI 24 BTG)",
    "name": "PS WALLPANEL",
    "bottom_price": 81696
  },
  {
    "id": 113,
    "sku": "WPC AT - PS 3 (ISI 24 BTG)",
    "name": "PS WALLPANEL",
    "bottom_price": 81696
  },
  {
    "id": 114,
    "sku": "WPC AT - PS 3 (1 METER)",
    "name": "WPC PANEL",
    "bottom_price": 33120
  },
  {
    "id": 115,
    "sku": "WPC AT - PS 2 (ISI 24 BTG)",
    "name": "PS WALLPANEL",
    "bottom_price": 81696
  },
  {
    "id": 116,
    "sku": "WPC AT - PS 1 (ISI 24 BTG)",
    "name": "PS WALLPANEL",
    "bottom_price": 81696
  },
  {
    "id": 117,
    "sku": "WHITE LED NEON (5 METER)",
    "name": "LED NEON STRIP (5 METER)",
    "bottom_price": 56396
  },
  {
    "id": 118,
    "sku": "WHITE LED NEON (1 METER)",
    "name": "LED NEON STRIP (1 METER)",
    "bottom_price": 19136
  },
  {
    "id": 119,
    "sku": "WHITE (50*40*48)",
    "name": "SMART NAKAS/ MEJA SAMPING TEMPAT TIDUR WHITE UK (50*40*48)",
    "bottom_price": 617136
  },
  {
    "id": 120,
    "sku": "WHITE (30*40*45)",
    "name": "SMART NAKAS/ MEJA SAMPING TEMPAT TIDUR WHITE UK (30*40*45)",
    "bottom_price": 846400
  },
  {
    "id": 121,
    "sku": "WDM-LY 92 (1,5M)",
    "name": "PLINT L",
    "bottom_price": 32016
  },
  {
    "id": 122,
    "sku": "WDM-LY 92",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 123,
    "sku": "WDM-LY 47 (1,5M)",
    "name": "PLINT L",
    "bottom_price": 32016
  },
  {
    "id": 124,
    "sku": "WDM-LY 47",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 125,
    "sku": "WDM-LY 10 PUTIH SOLID (1,5M)",
    "name": "PLINT L",
    "bottom_price": 32016
  },
  {
    "id": 126,
    "sku": "WDM-LY 10 PUTIH SOLID",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 127,
    "sku": "WDM-LY 09 (1,5M)",
    "name": "PLINT L",
    "bottom_price": 32016
  },
  {
    "id": 128,
    "sku": "WDM-LY 09",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 129,
    "sku": "WDM-LY 08 (1,5M)",
    "name": "PLINT L",
    "bottom_price": 32016
  },
  {
    "id": 130,
    "sku": "WDM-LY 08",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 131,
    "sku": "WDM-LY 05 (1,5 METER)",
    "name": "PLINT L",
    "bottom_price": 32016
  },
  {
    "id": 132,
    "sku": "WDM-LY 05",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 133,
    "sku": "WDM-LY 02 (1,5M)",
    "name": "PLINT L",
    "bottom_price": 32016
  },
  {
    "id": 134,
    "sku": "WDM-LY 02",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 135,
    "sku": "WB MB-6001",
    "name": "WALLBOARD LEBAR 60 CM",
    "bottom_price": 182896
  },
  {
    "id": 136,
    "sku": "WB MB-6002",
    "name": "WALLBOARD LEBAR 60 CM",
    "bottom_price": 182896
  },
  {
    "id": 137,
    "sku": "WB MB-6003",
    "name": "WALLBOARD LEBAR 60 CM",
    "bottom_price": 182896
  },
  {
    "id": 138,
    "sku": "WB MB-6004",
    "name": "WALLBOARD LEBAR 60 CM",
    "bottom_price": 182896
  },
  {
    "id": 139,
    "sku": "WB MB-6006",
    "name": "WALLBOARD LEBAR 60 CM",
    "bottom_price": 182896
  },
  {
    "id": 140,
    "sku": "WB ATX - 035",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 141,
    "sku": "WB ATX - 037",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 142,
    "sku": "WB ATX - 039",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 143,
    "sku": "WB ATX - 042",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 144,
    "sku": "WB ATX - 043",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 145,
    "sku": "WB ATX - 045",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 146,
    "sku": "WB ATX - 058",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 147,
    "sku": "WB ATX - 06",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 148,
    "sku": "WB ATX - 082",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 149,
    "sku": "WB ATX - 099",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 150,
    "sku": "WB ATX - A207",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 151,
    "sku": "WB ATX - A209",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 152,
    "sku": "WB ATX - A228",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 107456
  },
  {
    "id": 153,
    "sku": "WB SR-X 03",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 154,
    "sku": "WB SR-X 08",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 155,
    "sku": "WB SR-X 109",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 156,
    "sku": "WB SR-X 212",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 157,
    "sku": "WB SR-X 809",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 158,
    "sku": "WB SR-X 92 (PINK)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 159,
    "sku": "WB SRX- 022",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 160,
    "sku": "WB SRX- 06",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 161,
    "sku": "WB SRX- 106",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 162,
    "sku": "WB SRX- 340",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 163,
    "sku": "WB SRX- 81",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 164,
    "sku": "WB SRX- 88",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 165,
    "sku": "WB SRX-08",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 166,
    "sku": "WB SRX-082",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 167,
    "sku": "WB SRX-172",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 168,
    "sku": "WB SRX-436",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 169,
    "sku": "WB X - 029",
    "name": "WALLBOARD 8 MM 1DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 170,
    "sku": "WB X - 032",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 171,
    "sku": "WB X - 035",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 172,
    "sku": "WB X - 037",
    "name": "WALLBOARD 8 MM 1DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 173,
    "sku": "WB X - 042",
    "name": "WALLBOARD",
    "bottom_price": 107456
  },
  {
    "id": 174,
    "sku": "WB X - 043",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 175,
    "sku": "WATER RIPPLE - SILVER (1,45M)",
    "name": "PVC BOARD WATER RIPPLE SILVER",
    "bottom_price": 365700
  },
  {
    "id": 176,
    "sku": "WARM WHITE LED NEON 5 M (SB)",
    "name": "LED NEON STRIP 5 METER (SB)",
    "bottom_price": 56396
  },
  {
    "id": 177,
    "sku": "WARM WHITE LED NEON (5 METER)",
    "name": "LED NEON STRIP (5 METER)",
    "bottom_price": 56396
  },
  {
    "id": 178,
    "sku": "WARM WHITE LED NEON (1 METER)",
    "name": "LED NEON STRIP (1 METER)",
    "bottom_price": 19136
  },
  {
    "id": 179,
    "sku": "TRACK RELL PUTIH (2M)",
    "name": "TRACK RELL PUTIH PANJANG 2M",
    "bottom_price": 42412
  },
  {
    "id": 180,
    "sku": "TRACK RELL PUTIH (1M)",
    "name": "TRACK RELL PUTIH PANJANG 1M",
    "bottom_price": 23552
  },
  {
    "id": 181,
    "sku": "TRACK RELL HITAM (2M)",
    "name": "TRACK RELL HITAM PANJANG 2M",
    "bottom_price": 42412
  },
  {
    "id": 182,
    "sku": "TRACK RELL HITAM (1M)",
    "name": "TRACK RELL HITAM PANJANG 1M",
    "bottom_price": 23552
  },
  {
    "id": 183,
    "sku": "TERPAL A2 (UK 4M X 6M)",
    "name": "TERPAL BIRU SILVER",
    "bottom_price": 125028
  },
  {
    "id": 184,
    "sku": "TERPAL A2 (UK 3M X 4M)",
    "name": "TERPAL BIRU SILVER",
    "bottom_price": 49680
  },
  {
    "id": 185,
    "sku": "TERPAL A2 (UK 2M X 3M)",
    "name": "TERPAL BIRU SILVER",
    "bottom_price": 32016
  },
  {
    "id": 186,
    "sku": "Tembakan seulant",
    "name": "Tembakan seulant",
    "bottom_price": 24840
  },
  {
    "id": 187,
    "sku": "TEFLON KECIL UK (22,5 CM)",
    "name": "TEFPON KECIL UKURAN 22,5 CM ANTI LENGKET",
    "bottom_price": 52256
  },
  {
    "id": 188,
    "sku": "TEFLON BESAR UK (31 CM)",
    "name": "TEFLON BESAR UKURAN 31 CM ANTI LENGKET",
    "bottom_price": 52900
  },
  {
    "id": 189,
    "sku": "TEAK TUNGGAL (1.5M)",
    "name": "WPC PANEL OUTDOOR TUNGGAL WARNA TEAK",
    "bottom_price": 120428
  },
  {
    "id": 190,
    "sku": "ST 03",
    "name": "WALLPAPER STICKER",
    "bottom_price": 7754
  },
  {
    "id": 191,
    "sku": "SPB 05 (3M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 78936
  },
  {
    "id": 192,
    "sku": "SPB 05 (2M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 64584
  },
  {
    "id": 193,
    "sku": "SPB 05 (1M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 48944
  },
  {
    "id": 194,
    "sku": "SPB 04 (2M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 64584
  },
  {
    "id": 195,
    "sku": "SPB 04 (1M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 48944
  },
  {
    "id": 196,
    "sku": "SPB 03 (3M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 78936
  },
  {
    "id": 197,
    "sku": "SPB 03 (2M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 64584
  },
  {
    "id": 198,
    "sku": "SPB 03 (1M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 48944
  },
  {
    "id": 199,
    "sku": "SPB 02 (3M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 78936
  },
  {
    "id": 200,
    "sku": "SPB 02 (2M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 64584
  },
  {
    "id": 201,
    "sku": "SPB 02 (1M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 48944
  },
  {
    "id": 202,
    "sku": "SPB 01 (3M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 78936
  },
  {
    "id": 203,
    "sku": "SPB 01 (2M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 64584
  },
  {
    "id": 204,
    "sku": "SPB 01 (1M)",
    "name": "LIST PVC LAMPU PLAFON",
    "bottom_price": 48944
  },
  {
    "id": 205,
    "sku": "SIKU KARDUS TAMBAHAN",
    "name": "KARDUS TAMBAHAN UNTUK PACKING",
    "bottom_price": 9200
  },
  {
    "id": 206,
    "sku": "S-83153 (45)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 207,
    "sku": "S-83144 (19)",
    "name": "CH",
    "bottom_price": 68540
  },
  {
    "id": 208,
    "sku": "S-83136 (87)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 209,
    "sku": "S-83132 (86)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 210,
    "sku": "S-83131 (84)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 211,
    "sku": "S-83126 (53)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 212,
    "sku": "S-83053 (16)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 213,
    "sku": "S-83052 (17)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 214,
    "sku": "S-83051 (20)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 215,
    "sku": "S-83035 (4)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 216,
    "sku": "S-83033 (5)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 217,
    "sku": "S-83031 (6)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 218,
    "sku": "S-83025 (35)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 219,
    "sku": "S-83023 (37)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 220,
    "sku": "S-83022 (32)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 221,
    "sku": "S-83015 (34)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 222,
    "sku": "S-83013 (31)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 223,
    "sku": "RUMAH LAMPU LED (1 Meter)",
    "name": "LAMPU LED",
    "bottom_price": 30820
  },
  {
    "id": 224,
    "sku": "ROLLER BLINT",
    "name": "ROLLER BLINT",
    "bottom_price": 27600
  },
  {
    "id": 225,
    "sku": "RM 8",
    "name": "GORDEN JADI 120 X 140 CM",
    "bottom_price": 64023
  },
  {
    "id": 226,
    "sku": "RM 06",
    "name": "GORDYN ROMANA",
    "bottom_price": 64023
  },
  {
    "id": 227,
    "sku": "RM 05 GORDEN JADI",
    "name": "GORDEN JADI UK 120 X 140 CM",
    "bottom_price": 64023
  },
  {
    "id": 228,
    "sku": "RESIN BOARD AKRILIK MOTIF 06",
    "name": "RESIN BOARD AKRILIK MOTIF 06 (MARMER HITAM PUTIH) PANJANG 2,44 M",
    "bottom_price": 562948
  },
  {
    "id": 229,
    "sku": "RESIN BOARD AKRILIK MOTIF 05",
    "name": "RESIN BOARD AKRILIK MOTIF 05 (MARMER KUNING PUTIH) PANJANG 2,44 M",
    "bottom_price": 562948
  },
  {
    "id": 230,
    "sku": "RESIN BOARD AKRILIK MOTIF 04",
    "name": "RESIN BOARD AKRILIK MOTIF 04 (MARMER PUTIH GARIS ABU\") PANJANG 2,44 M",
    "bottom_price": 562948
  },
  {
    "id": 231,
    "sku": "RESIN BOARD AKRILIK MOTIF 03",
    "name": "RESIN BOARD AKRILIK MOTIF 03 ( MARMER KUNING) PANJANG 2,44 M",
    "bottom_price": 562948
  },
  {
    "id": 232,
    "sku": "RESIN BOARD AKRILIK MOTIF 02",
    "name": "RESIN BOARD AKRILIK MOTIF 02 (MARMER PINK) PANJANG 2,44 M",
    "bottom_price": 562948
  },
  {
    "id": 233,
    "sku": "RESIN BOARD AKRILIK MOTIF 01",
    "name": "RESIN BOARD AKRILIK MOTIF 01 (AWAN) PANJANG 2,44 M",
    "bottom_price": 562948
  },
  {
    "id": 234,
    "sku": "REL GORDEN KRISTAL SILVER",
    "name": "REL GORDEN",
    "bottom_price": 640320
  },
  {
    "id": 235,
    "sku": "REL GORDEN KRISTAL GOLD",
    "name": "REL GORDEN",
    "bottom_price": 883200
  },
  {
    "id": 236,
    "sku": "PVCB-02 (GOLD)",
    "name": "PVC BOARD MIRROR WARNA GOLD",
    "bottom_price": 483000
  },
  {
    "id": 237,
    "sku": "PVCB-02 (GOLD) (1.45M)",
    "name": "PVC BOARD MIRROR WARNA GOLD",
    "bottom_price": 274620
  },
  {
    "id": 238,
    "sku": "PVCB- 001 (SILVER)",
    "name": "PVC BOARD MIRROR WARNA SILVER",
    "bottom_price": 483000
  },
  {
    "id": 239,
    "sku": "PVCB- 001 (SILVER) - (1.5M)",
    "name": "PVC BOARD MIRROR WARNA SILVER",
    "bottom_price": 274620
  },
  {
    "id": 240,
    "sku": "PVCB - 013 (HITAM) - (1.45M)",
    "name": "PVC BOARD MIRROR WARNA HITAM",
    "bottom_price": 274620
  },
  {
    "id": 241,
    "sku": "PVCB - 013 (HITAM)",
    "name": "PVC BOARD MIRROR WARNA HITAM",
    "bottom_price": 483000
  },
  {
    "id": 242,
    "sku": "PU STONE NO 15",
    "name": "PU STONE (B)",
    "bottom_price": 178940
  },
  {
    "id": 243,
    "sku": "PU STONE B-05 NEW",
    "name": "PU STONE (B) NEW",
    "bottom_price": 178940
  },
  {
    "id": 244,
    "sku": "PU STONE B 05",
    "name": "PU STONE (B)",
    "bottom_price": 178940
  },
  {
    "id": 245,
    "sku": "PU STONE B 03",
    "name": "PU STONE (B)",
    "bottom_price": 178940
  },
  {
    "id": 246,
    "sku": "PU STONE B 01",
    "name": "PU STONE (B)",
    "bottom_price": 178940
  },
  {
    "id": 247,
    "sku": "PU STONE A-15",
    "name": "PU STONE (B)",
    "bottom_price": 178940
  },
  {
    "id": 248,
    "sku": "PU STONE A-14",
    "name": "PU STONE (B)",
    "bottom_price": 178940
  },
  {
    "id": 249,
    "sku": "PU STONE 02",
    "name": "PU STONE",
    "bottom_price": 178940
  },
  {
    "id": 250,
    "sku": "PN1002 (9)",
    "name": "GREEN 8 CITY",
    "bottom_price": 36800
  },
  {
    "id": 251,
    "sku": "PLINT LY 56 (1,5M)",
    "name": "PLINT L WPC",
    "bottom_price": 32016
  },
  {
    "id": 252,
    "sku": "PLINT LY 56",
    "name": "PLINT L WPC",
    "bottom_price": 38916
  },
  {
    "id": 253,
    "sku": "PLINT LY 121 (1,5M)",
    "name": "PLINT L WPC",
    "bottom_price": 32016
  },
  {
    "id": 254,
    "sku": "PLINT LY 04",
    "name": "PLINT L WPC",
    "bottom_price": 38916
  },
  {
    "id": 255,
    "sku": "PLINT LY 03",
    "name": "PLINT L WPC",
    "bottom_price": 38916
  },
  {
    "id": 256,
    "sku": "PLINT LY 02",
    "name": "PLINT L WPC",
    "bottom_price": 38916
  },
  {
    "id": 257,
    "sku": "PLINT LY 01 (1,5M)",
    "name": "PLINT L WPC",
    "bottom_price": 32016
  },
  {
    "id": 258,
    "sku": "PLINT LY 01",
    "name": "PLINT WPC",
    "bottom_price": 38916
  },
  {
    "id": 259,
    "sku": "PLINT LG 10",
    "name": "PLINT L",
    "bottom_price": 38916
  },
  {
    "id": 260,
    "sku": "PLINT LG 02",
    "name": "PLINT LG 02",
    "bottom_price": 38916
  },
  {
    "id": 261,
    "sku": "PEMOTONG KACA",
    "name": "KACA",
    "bottom_price": 27600
  },
  {
    "id": 262,
    "sku": "PAKING KAYU",
    "name": "KAYU/ TRIPLEK",
    "bottom_price": 9200
  },
  {
    "id": 263,
    "sku": "ORANYE (48*40*46)",
    "name": "SMART NAKAS/ MEJA SAMPING TEMPAT TIDUR ORANYE UK (48*40*46)",
    "bottom_price": 726800
  },
  {
    "id": 264,
    "sku": "MEJA TAMU 60701 PUTIH",
    "name": "MEJA TAMU 60701 PUTIH",
    "bottom_price": 869860
  },
  {
    "id": 265,
    "sku": "MEJA TAMU 50702 PUTIH",
    "name": "MEJA TAMU 50702 PUTIH",
    "bottom_price": 1058000
  },
  {
    "id": 266,
    "sku": "MEJA TAMU 50701 ABU",
    "name": "MEJA TAMU 50701 ABU",
    "bottom_price": 773260
  },
  {
    "id": 267,
    "sku": "MD 12 FLOOR DECKING",
    "name": "FLOOR DECKING",
    "bottom_price": 200468
  },
  {
    "id": 268,
    "sku": "M90036 (17)",
    "name": "GE",
    "bottom_price": 68540
  },
  {
    "id": 269,
    "sku": "M76504 (58)",
    "name": "EIGHT",
    "bottom_price": 68540
  },
  {
    "id": 270,
    "sku": "M76406 (2)",
    "name": "EIGHT",
    "bottom_price": 68540
  },
  {
    "id": 271,
    "sku": "M76405 (4)",
    "name": "EIGHT",
    "bottom_price": 68540
  },
  {
    "id": 272,
    "sku": "M76402 (12)",
    "name": "EIGHT",
    "bottom_price": 68540
  },
  {
    "id": 273,
    "sku": "M76306 (20)",
    "name": "EIGHT",
    "bottom_price": 68540
  },
  {
    "id": 274,
    "sku": "M76162 (53)",
    "name": "EIGHT",
    "bottom_price": 68540
  },
  {
    "id": 275,
    "sku": "LV719 (65)",
    "name": "WD",
    "bottom_price": 68540
  },
  {
    "id": 276,
    "sku": "LV 757",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 277,
    "sku": "LV 745",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 278,
    "sku": "LV 744",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 279,
    "sku": "LV 743",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 280,
    "sku": "LV 742",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 281,
    "sku": "LV 741",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 282,
    "sku": "LV 737 (67)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 283,
    "sku": "LV 735",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 68540
  },
  {
    "id": 284,
    "sku": "LV 734 (69)",
    "name": "WD",
    "bottom_price": 68540
  },
  {
    "id": 285,
    "sku": "LV 706 (62)",
    "name": "WD",
    "bottom_price": 68540
  },
  {
    "id": 286,
    "sku": "LS 4 (1.5M)",
    "name": "LIST SIKU PS",
    "bottom_price": 32016
  },
  {
    "id": 287,
    "sku": "LS 4",
    "name": "LIST SIKU PS",
    "bottom_price": 38916
  },
  {
    "id": 288,
    "sku": "LS 3 (1.5M)",
    "name": "LIST SIKU PS",
    "bottom_price": 32016
  },
  {
    "id": 289,
    "sku": "LS 3",
    "name": "LIST SIKU PS",
    "bottom_price": 38916
  },
  {
    "id": 290,
    "sku": "LS 2 (1.5M)",
    "name": "LIST SIKU PS",
    "bottom_price": 32016
  },
  {
    "id": 291,
    "sku": "LS 2",
    "name": "LIST SIKU PS",
    "bottom_price": 38916
  },
  {
    "id": 292,
    "sku": "LS 1 (1.5M)",
    "name": "LIST SIKU PS",
    "bottom_price": 32016
  },
  {
    "id": 293,
    "sku": "LS 1",
    "name": "LIST SIKU PS",
    "bottom_price": 38916
  },
  {
    "id": 294,
    "sku": "LPM-BBX HITAM SOLID (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 295,
    "sku": "LPM-BBX 6002 (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 296,
    "sku": "LPM-BBX 039 (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 297,
    "sku": "LPM-BBX 035 (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 298,
    "sku": "LPM-BBX 031 (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 299,
    "sku": "LPM-BBX 028 (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 300,
    "sku": "LPM-BBX 017 (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 301,
    "sku": "LPM-BBX 014 (B)",
    "name": "LIST PLANK 8 CM (B)",
    "bottom_price": 42136
  },
  {
    "id": 302,
    "sku": "LIST W SILVER",
    "name": "LIST W SILVER 8 MILI",
    "bottom_price": 38456
  },
  {
    "id": 303,
    "sku": "LIST W ROSE GOLD",
    "name": "LIST W ROSE GOLD 8 MILI",
    "bottom_price": 38456
  },
  {
    "id": 304,
    "sku": "LIST W GOLD",
    "name": "LIST W GOLD 8 MILI",
    "bottom_price": 38456
  },
  {
    "id": 305,
    "sku": "LIST U SHAPPIRE MIRROR",
    "name": "LIST U  SHAPPIRE MIRROR",
    "bottom_price": 55936
  },
  {
    "id": 306,
    "sku": "LIST U ROSE GOLD MIRROR",
    "name": "LIST U ROSE GOLD MIRROR",
    "bottom_price": 55936
  },
  {
    "id": 307,
    "sku": "LIST U GOLD TITANIUM MIRROR",
    "name": "LIST U GOLD TITANIUM MIRROR",
    "bottom_price": 55936
  },
  {
    "id": 308,
    "sku": "LIST U BLACK MIROR",
    "name": "LIST U BLACK MIROR",
    "bottom_price": 55936
  },
  {
    "id": 309,
    "sku": "LIST T SILVER",
    "name": "LIST T UNTUK PVC MARBLE",
    "bottom_price": 49220
  },
  {
    "id": 310,
    "sku": "LIST T ROSE GOLD (8MM)",
    "name": "LIST T UNTUK PVC MARBLE",
    "bottom_price": 49220
  },
  {
    "id": 311,
    "sku": "LIST T ROSE GOLD",
    "name": "LIST T UNTUK PVC MARBLE",
    "bottom_price": 49220
  },
  {
    "id": 312,
    "sku": "LIST T LED SILVER",
    "name": "LIST T LED SILVER 8 MILI",
    "bottom_price": 62376
  },
  {
    "id": 313,
    "sku": "LIST T LED ROSE GOLD",
    "name": "LIST T LED ROSE GOLD 8 MILI",
    "bottom_price": 62376
  },
  {
    "id": 314,
    "sku": "LIST T LED GOLD",
    "name": "LIST T LED GOLD  8 MILI",
    "bottom_price": 62376
  },
  {
    "id": 315,
    "sku": "LIST T KECIL SILVER (1 CM)",
    "name": "LIST T KECIL SILVER 1 CM",
    "bottom_price": 384192
  },
  {
    "id": 316,
    "sku": "LIST T HITAM (8 MM)",
    "name": "LIST T UNTUK PVC MARBLE",
    "bottom_price": 53820
  },
  {
    "id": 317,
    "sku": "LIST T HITAM (3MM)",
    "name": "LIST T UNTUK PVC MARBLE",
    "bottom_price": 49220
  },
  {
    "id": 318,
    "sku": "LIST T GOLD (8 MM)",
    "name": "LIST T UNTUK PVC MARBLE",
    "bottom_price": 49220
  },
  {
    "id": 319,
    "sku": "LIST T GOLD (5 MM)",
    "name": "LIAT T UNTUK PVCBOARD SHEET",
    "bottom_price": 52256
  },
  {
    "id": 320,
    "sku": "LIST T GOLD",
    "name": "LIST T UNTUK PVC MARBLE",
    "bottom_price": 49220
  },
  {
    "id": 321,
    "sku": "LIST T BLACK (5 MM)",
    "name": "LIST T UNTUK PVCBOARD SHEET",
    "bottom_price": 52256
  },
  {
    "id": 322,
    "sku": "LIST STRIP GOLD 30 MM",
    "name": "LIST STRIP GOLD LEBAR 30 MILI",
    "bottom_price": 9936
  },
  {
    "id": 323,
    "sku": "LIST STRIP GOLD",
    "name": "LIST STRIP GOLD LEBAR 8 MILI",
    "bottom_price": 7544
  },
  {
    "id": 324,
    "sku": "LIST STICKER SILVER (3 CM)",
    "name": "LIST STICKER SILVER LEBAR 3 CM PANJANG 50 M",
    "bottom_price": 40940
  },
  {
    "id": 325,
    "sku": "LIST STICKER SILVER (2CM)",
    "name": "LIST STICKER SILVER LEBAR 2 CM PANJANG 50 M",
    "bottom_price": 30360
  },
  {
    "id": 326,
    "sku": "LIST STICKER ROSE GOLD (3CM)",
    "name": "LIST STICKER ROSE GOLD LEBAR 3 CM PANJANG 50 M",
    "bottom_price": 40940
  },
  {
    "id": 327,
    "sku": "LIST STICKER ROSE GOLD (2 CM)",
    "name": "LIST STICKER ROSE GOLD LEBAR 2 CM PANJANG 50 M",
    "bottom_price": 30360
  },
  {
    "id": 328,
    "sku": "LIST STICKER GOLD (3 CM)",
    "name": "LIST STICKER GOLD LEBAR 3 CM PANJANG 50 M",
    "bottom_price": 40940
  },
  {
    "id": 329,
    "sku": "LIST STICKER GOLD (2 CM)",
    "name": "LIST STICKER GOLD LEBAR 2 CM PANJANG 50 M",
    "bottom_price": 30360
  },
  {
    "id": 330,
    "sku": "LIST PLANK M-6002 (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 331,
    "sku": "LIST PLANK M- 039 (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 332,
    "sku": "LIST PLANK M- 035 (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 333,
    "sku": "LIST PLANK M- 031 (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 334,
    "sku": "LIST PLANK M- 028 (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 335,
    "sku": "LIST PLANK M- 017 (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 336,
    "sku": "LIST PLANK M- 014 (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 337,
    "sku": "LIST PLANK HITAM SOLID (B)",
    "name": "LIST PLANK (B)",
    "bottom_price": 55936
  },
  {
    "id": 338,
    "sku": "LIST PLANK ALUMUNIUM ABU\" TUA",
    "name": "LIST PLANK ALUMUNIUM",
    "bottom_price": 133400
  },
  {
    "id": 339,
    "sku": "LIST PLANK ALUMUNIUM ABU\" MUDA",
    "name": "LIST PLANK ALUMUNIUM",
    "bottom_price": 133400
  },
  {
    "id": 340,
    "sku": "LIST F SILVER",
    "name": "LIST F SILVER 8 MILI",
    "bottom_price": 44988
  },
  {
    "id": 341,
    "sku": "LIST F ROSE GOLD",
    "name": "LIST F ROSE GOLD 8 MILI",
    "bottom_price": 44988
  },
  {
    "id": 342,
    "sku": "LIST F GOLD",
    "name": "LIST F GOLD 8 MILI",
    "bottom_price": 44988
  },
  {
    "id": 343,
    "sku": "LIST ENDING U HITAM(8MM)",
    "name": "LIST ENDING U HITAM(8MM)",
    "bottom_price": 54096
  },
  {
    "id": 344,
    "sku": "LIST ENDING U GOLD(8MM)",
    "name": "LIST ENDING U GOLD(8MM)",
    "bottom_price": 54096
  },
  {
    "id": 345,
    "sku": "LG-581202 (8)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 346,
    "sku": "LG-581201 (11)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 347,
    "sku": "LG-581103 (12)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 348,
    "sku": "LG-581102 (9)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 349,
    "sku": "LG-580903 (63)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 350,
    "sku": "LG-580807 (69)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 351,
    "sku": "LG-580805 (70)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 352,
    "sku": "LG-580704 (76)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 353,
    "sku": "LG-580703 (82)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 354,
    "sku": "LG-580604 (52)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 355,
    "sku": "LG-580202 (105)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 356,
    "sku": "LG-580102 (60)",
    "name": "CHLOE",
    "bottom_price": 68540
  },
  {
    "id": 357,
    "sku": "LEM WALLPAPER GREATWALL",
    "name": "LEM WALLPAPER GREATWALL 80 GRAM",
    "bottom_price": 24840
  },
  {
    "id": 358,
    "sku": "LEM SEALENT SL- CLEAR",
    "name": "LEM SEALENT ASAM",
    "bottom_price": 24840
  },
  {
    "id": 359,
    "sku": "LEM SEALENT NETRAL",
    "name": "LEM SEALENT NON ASAM",
    "bottom_price": 35880
  },
  {
    "id": 360,
    "sku": "LEM POWER GLUE",
    "name": "LEM KOREA",
    "bottom_price": 7544
  },
  {
    "id": 361,
    "sku": "LEM FOX GRADE B (2.5KG)",
    "name": "LEM UNTUK VINIL LANTAI",
    "bottom_price": 191176
  },
  {
    "id": 362,
    "sku": "LEM FOX GRADE A (2.5KG)",
    "name": "LEM UNTUK VINIL LANTAI",
    "bottom_price": 191176
  },
  {
    "id": 363,
    "sku": "KW CUSTOM (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 364,
    "sku": "KW 92 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 365,
    "sku": "KW 56 (FRAME)",
    "name": "WPC",
    "bottom_price": 27600
  },
  {
    "id": 366,
    "sku": "KW 47 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 367,
    "sku": "KW 24 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 368,
    "sku": "KW 121 (FRAME)",
    "name": "WPC",
    "bottom_price": 27600
  },
  {
    "id": 369,
    "sku": "KW 114 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 370,
    "sku": "KW 101 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 371,
    "sku": "KW 10 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 372,
    "sku": "KW 09 FRAME",
    "name": "FRAME WPC HITAM",
    "bottom_price": 27600
  },
  {
    "id": 373,
    "sku": "KW 08 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 374,
    "sku": "KW 05 FRAME",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 375,
    "sku": "KW 03 FRAME",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 376,
    "sku": "KW 02 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 377,
    "sku": "KW 01 (FRAME)",
    "name": "FRAME WPC",
    "bottom_price": 27600
  },
  {
    "id": 378,
    "sku": "KW - 003",
    "name": "WALLSTICKER",
    "bottom_price": 27600
  },
  {
    "id": 379,
    "sku": "KS34 KISI PLAFON (5 CM X 9 CM)",
    "name": "KISI - KISI PLAFON UK 5 CM X 9 CM",
    "bottom_price": 98348
  },
  {
    "id": 380,
    "sku": "KS34 KISI PLAFON (4CM X 4,5CM)",
    "name": "KISI - KISI PLAFON UK 4 CM X 4,5 CM",
    "bottom_price": 68632
  },
  {
    "id": 381,
    "sku": "KS 34 UK 4 CM X 5 CM",
    "name": "KISI PARTISI",
    "bottom_price": 68632
  },
  {
    "id": 382,
    "sku": "KS 31 UK 4CM X 5 CM",
    "name": "KISI PARTISI (gudang sby rusak 37)",
    "bottom_price": 68632
  },
  {
    "id": 383,
    "sku": "KS 121 UK 4CM X 5CM",
    "name": "KISI PARTISI",
    "bottom_price": 68632
  },
  {
    "id": 384,
    "sku": "KS 121 UK 10CM X 5CM",
    "name": "KISI PARTISI",
    "bottom_price": 98348
  },
  {
    "id": 385,
    "sku": "KS 06 UK 4CM X 5CM (1,45M)",
    "name": "KISI PARTISI",
    "bottom_price": 441964
  },
  {
    "id": 386,
    "sku": "KS 06 UK 4CM X 5CM",
    "name": "KISI PARTISI",
    "bottom_price": 68632
  },
  {
    "id": 387,
    "sku": "KS 06 UK 10CM X 5CM",
    "name": "KISI KISI PARTISI",
    "bottom_price": 98348
  },
  {
    "id": 388,
    "sku": "KS 02 UK 4 CM X 5 CM (1,45M)",
    "name": "KISI PARTISI",
    "bottom_price": 284120
  },
  {
    "id": 389,
    "sku": "KS 02 UK 4 CM X 5 CM",
    "name": "KISI PARTISI",
    "bottom_price": 68632
  },
  {
    "id": 390,
    "sku": "KLIP WPC",
    "name": "KLIP WPC PANEL",
    "bottom_price": 506
  },
  {
    "id": 391,
    "sku": "G8Y 6069",
    "name": "WALLBOARD 60 CM 1 DUS ISI 5",
    "bottom_price": 182896
  },
  {
    "id": 392,
    "sku": "G8Y 6063",
    "name": "WALLBOARD 60 CM 1 DUS ISI 5",
    "bottom_price": 182896
  },
  {
    "id": 393,
    "sku": "G8Y 6062",
    "name": "WALLBOARD 60 CM 1 DUS ISI 5",
    "bottom_price": 182896
  },
  {
    "id": 394,
    "sku": "G8Y 6060",
    "name": "WALLBOARD 60 CM 1 DUS ISI 5",
    "bottom_price": 182896
  },
  {
    "id": 395,
    "sku": "G8Y 6031",
    "name": "WALLBOARD 60 CM 1 DUS ISI 5",
    "bottom_price": 182896
  },
  {
    "id": 396,
    "sku": "G8Y 31 (KULIT BATU)",
    "name": "KULIT BATU/FLEXI BOARD",
    "bottom_price": 212336
  },
  {
    "id": 397,
    "sku": "G8Y 305",
    "name": "VINYL 2MM NEW",
    "bottom_price": 275540
  },
  {
    "id": 398,
    "sku": "G8Y 304",
    "name": "VINYL 2MM NEW",
    "bottom_price": 275540
  },
  {
    "id": 399,
    "sku": "G8Y 303",
    "name": "VINYL 2MM NEW",
    "bottom_price": 275540
  },
  {
    "id": 400,
    "sku": "G8Y 302",
    "name": "VINYL 2MM NEW",
    "bottom_price": 275540
  },
  {
    "id": 401,
    "sku": "G8Y 301",
    "name": "VINYL 2 MM NEW",
    "bottom_price": 275540
  },
  {
    "id": 402,
    "sku": "G8Y 24 (KULIT BATU)",
    "name": "KULIT BATU/FLEXI STONE",
    "bottom_price": 212336
  },
  {
    "id": 403,
    "sku": "G8Y 202",
    "name": "VINYL 2MM",
    "bottom_price": 275540
  },
  {
    "id": 404,
    "sku": "G8Y 201",
    "name": "VINYL 2MM",
    "bottom_price": 275540
  },
  {
    "id": 405,
    "sku": "G8Y 17 (KULIT BATU)",
    "name": "KULIT BATU/FLEXI STONE",
    "bottom_price": 212336
  },
  {
    "id": 406,
    "sku": "G8Y 13 (KULIT BATU)",
    "name": "KULIT BATU / FLEXI STONE",
    "bottom_price": 212336
  },
  {
    "id": 407,
    "sku": "G8Y 13",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 408,
    "sku": "G8Y 12",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 409,
    "sku": "G8Y 11",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 410,
    "sku": "G8Y 10 E",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 411,
    "sku": "G8Y 08",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 412,
    "sku": "G8Y 07",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 413,
    "sku": "G8Y 06 E",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 414,
    "sku": "G8Y 06 (KULIT BATU)",
    "name": "KULIT BATU/FLEXI STONE",
    "bottom_price": 212336
  },
  {
    "id": 415,
    "sku": "G8Y 05",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 416,
    "sku": "G8Y 04",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 417,
    "sku": "G8Y 03",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 418,
    "sku": "G8Y 02",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 419,
    "sku": "G8Y 01",
    "name": "VINYL (3 MM)",
    "bottom_price": 341136
  },
  {
    "id": 420,
    "sku": "FR GYM HITAM POLOS",
    "name": "FLOOR RIBBER GYM",
    "bottom_price": 97428
  },
  {
    "id": 421,
    "sku": "FR GYM HITAM BINTIK KUNING",
    "name": "FLOOR RUBBER GYM",
    "bottom_price": 97428
  },
  {
    "id": 422,
    "sku": "FR GYM HITAM BINTIK BIRU",
    "name": "FLOOR RUBBER GYM",
    "bottom_price": 97428
  },
  {
    "id": 423,
    "sku": "FR GYM - HITAM BINTIK PUTIH",
    "name": "FLOOR RUBER GYM",
    "bottom_price": 97428
  },
  {
    "id": 424,
    "sku": "F71145 (32) - LOT B",
    "name": "EG",
    "bottom_price": 68632
  },
  {
    "id": 425,
    "sku": "F71126 (56)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 426,
    "sku": "F71125 (55)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 427,
    "sku": "F71096 (57)",
    "name": "EG",
    "bottom_price": 68632
  },
  {
    "id": 428,
    "sku": "F71093 (31)",
    "name": "WD",
    "bottom_price": 68632
  },
  {
    "id": 429,
    "sku": "F71093",
    "name": "EG",
    "bottom_price": 68632
  },
  {
    "id": 430,
    "sku": "F71071 (15)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 431,
    "sku": "F71063 (54)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 432,
    "sku": "F71051 (44)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 433,
    "sku": "F71035 (35)",
    "name": "EG",
    "bottom_price": 68632
  },
  {
    "id": 434,
    "sku": "F71026 (69)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 435,
    "sku": "F71024 (62)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 436,
    "sku": "F71023 (66)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 437,
    "sku": "F71022 (67)",
    "name": "EIGHT",
    "bottom_price": 68632
  },
  {
    "id": 438,
    "sku": "ES37076 (30)",
    "name": "GREEN 8 CITY",
    "bottom_price": 68632
  },
  {
    "id": 439,
    "sku": "ES37044 (64)",
    "name": "GE",
    "bottom_price": 68632
  },
  {
    "id": 440,
    "sku": "EP-36085 (42)",
    "name": "GREEN 8 CITY",
    "bottom_price": 68632
  },
  {
    "id": 441,
    "sku": "DY 01",
    "name": "DECKING FLOOR",
    "bottom_price": 200468
  },
  {
    "id": 442,
    "sku": "DUDUKAN KISI KISI (ISI 10 PCS)",
    "name": "KISI KISI",
    "bottom_price": 50140
  },
  {
    "id": 443,
    "sku": "DT 8020 VINIL ROLLAN (5M)",
    "name": "VINIL ROLLAN PREMIUM TEBAL 2 MM (120 CM X 5 M)",
    "bottom_price": 293296
  },
  {
    "id": 444,
    "sku": "DT 8020 VINIL ROLLAN",
    "name": "VINIL ROLLAN PREMIUM TEBAL 2 MM (120 CM X 10 M)",
    "bottom_price": 514740
  },
  {
    "id": 445,
    "sku": "DT 8018 VINIL ROLLAN",
    "name": "VINIL ROLLAN PREMIUM TEBAL 2 MM (120 CM X 10 M)",
    "bottom_price": 514740
  },
  {
    "id": 446,
    "sku": "KACA BEVEL KOTAK TYPE B",
    "name": "KACA BEVEL KOTAK TYPE B UK 20 X 20",
    "bottom_price": 28060
  },
  {
    "id": 447,
    "sku": "DOUBLE TAPE",
    "name": "DOUBLE TAPE",
    "bottom_price": 8464
  },
  {
    "id": 448,
    "sku": "DOOR CLOSER BROWN",
    "name": "DOOR CLOSER ORCHAD BROWN",
    "bottom_price": 119416
  },
  {
    "id": 449,
    "sku": "DOOR CLOSER BLACK",
    "name": "DOOR CLOSER ORCHAD BLACK",
    "bottom_price": 119416
  },
  {
    "id": 450,
    "sku": "DO048 PVC SHEET(25CM X120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 451,
    "sku": "DO024 PVC SHEET (25CM X120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 452,
    "sku": "DO014NEW PVC SHEET 120CM X 50M",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (NEW)",
    "bottom_price": 736000
  },
  {
    "id": 453,
    "sku": "DO014 PVC SHEET(25 CM X120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 454,
    "sku": "DO013 PVC SHEET(NEW)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 736000
  },
  {
    "id": 455,
    "sku": "DO013 PVC SHEET (25CM X120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (NEW)",
    "bottom_price": 9016
  },
  {
    "id": 456,
    "sku": "DO013 PVC SHEET (25CM X120CM",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 457,
    "sku": "DO012 PVC SHEET(NEW)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (ROLLAN)",
    "bottom_price": 736000
  },
  {
    "id": 458,
    "sku": "DO012 PVC SHEET(25 CM X120 CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 459,
    "sku": "DO012 PVC SHEET (25CM X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (NEW)",
    "bottom_price": 9016
  },
  {
    "id": 460,
    "sku": "DO010 PVC SHEET(50 M X120CM)",
    "name": "PVC SHEET MARBLE (ROLLAN)",
    "bottom_price": 736000
  },
  {
    "id": 461,
    "sku": "DO010 PVC SHEET(25CM X120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 462,
    "sku": "DO01 PVC SHEET(25CM X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 463,
    "sku": "DO002 PVC SHEET (50M X 120CM)",
    "name": "PVC SHEET MARBLE (ROLLAN) NEW",
    "bottom_price": 736000
  },
  {
    "id": 464,
    "sku": "DO001 PVC SHEET(50M X 120CM)",
    "name": "PVC SHEET MARBLE (ROLLAN)",
    "bottom_price": 736000
  },
  {
    "id": 465,
    "sku": "DO OO9 PVC SHEET(25CM X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9016
  },
  {
    "id": 466,
    "sku": "DO OO9 PVC SHEET (50M X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (ROLLAN)",
    "bottom_price": 736000
  },
  {
    "id": 467,
    "sku": "DLM 014 VINIL ROLLAN (5 METER)",
    "name": "VINIL ROLLAN PREMIUM TEBAL 2 MM (120 CM X 5 M)",
    "bottom_price": 293296
  },
  {
    "id": 468,
    "sku": "DLM 014 VINIL ROLLAN",
    "name": "VINIL ROLLAN PREMIUM TEBAL 2 MM (120 CM X 10 M)",
    "bottom_price": 514740
  },
  {
    "id": 469,
    "sku": "COLOKAN USB WHITE",
    "name": "COLOKAN USB",
    "bottom_price": 44344
  },
  {
    "id": 470,
    "sku": "AT-Y 24",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 471,
    "sku": "AT-Y 121",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 472,
    "sku": "AT-Y 05",
    "name": "WPC PANEL 4STRIP",
    "bottom_price": 81696
  },
  {
    "id": 473,
    "sku": "AT-Y 03",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 474,
    "sku": "AT-Y 02",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 475,
    "sku": "AT-Y 01 (1M)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 476,
    "sku": "AT-Y 01",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 477,
    "sku": "AT-PVCB 01 SILVER (MIRROR)",
    "name": "PVC BOARD MIRROR SILVER",
    "bottom_price": 483000
  },
  {
    "id": 478,
    "sku": "AT-PVCB 03 BROWNZE (MIRROR)",
    "name": "PVC BOARD MIRROR BROWNZE",
    "bottom_price": 483000
  },
  {
    "id": 479,
    "sku": "AT-PVCB 13 BLACK (MIRROR)",
    "name": "PVC BOARD MIRROR BLACK",
    "bottom_price": 483000
  },
  {
    "id": 480,
    "sku": "AT-PVCB 18 PINK (MIRROR)",
    "name": "PVC BOARD MIRROR PINK",
    "bottom_price": 483000
  },
  {
    "id": 481,
    "sku": "AT-PVCB 01 SILVER (MIRROR)1,45",
    "name": "PVC BOARD MIRROR SILVER",
    "bottom_price": 274620
  },
  {
    "id": 482,
    "sku": "AT-PANEL CA 15 (ISI 10 BTG)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 98440
  },
  {
    "id": 483,
    "sku": "AT-PANEL CA 15 (1 METER)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 484,
    "sku": "AT-PANEL CA 14 (ISI 10 BTG)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 98440
  },
  {
    "id": 485,
    "sku": "AT-PANEL CA 14 (1 METER)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 486,
    "sku": "AT-PANEL CA 13 (ISI 10 BTG)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 98440
  },
  {
    "id": 487,
    "sku": "AT-PANEL CA 12 (ISI 10 BTG)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 98440
  },
  {
    "id": 488,
    "sku": "AT-PANEL CA 12 (1 METER)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 489,
    "sku": "AT-PANEL CA 11 (ISI 10 BTG)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 98440
  },
  {
    "id": 490,
    "sku": "AT-PANEL CA 11 (1 METER)",
    "name": "PANEL CA LIST GOLD UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 491,
    "sku": "AT-PANEL CA 105 (ISI 10 BTG)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 90896
  },
  {
    "id": 492,
    "sku": "AT-PANEL CA 105 (1 METER)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 493,
    "sku": "AT-PANEL CA 104 (ISI 10 BTG)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 90896
  },
  {
    "id": 494,
    "sku": "AT-PANEL CA 104 (1 METER)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 495,
    "sku": "AT-PANEL CA 103 (ISI 10 BTG)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 90896
  },
  {
    "id": 496,
    "sku": "AT-PANEL CA 103 (1 METER)",
    "name": "PANEL CA UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 497,
    "sku": "AT-PANEL CA 102 (ISI 10 BTG)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 90896
  },
  {
    "id": 498,
    "sku": "AT-PANEL CA 102 (1 METER)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 499,
    "sku": "AT-PANEL CA 101 (ISI 10 BTG)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 90896
  },
  {
    "id": 500,
    "sku": "AT-PANEL CA 101 (1 METER)",
    "name": "PANEL AC UK 30 CM",
    "bottom_price": 43056
  },
  {
    "id": 501,
    "sku": "AT-LMT 6 CM",
    "name": "LIST MOULDING",
    "bottom_price": 44160
  },
  {
    "id": 502,
    "sku": "AT-LMT 2,5 CM",
    "name": "LIST MOULDING",
    "bottom_price": 21068
  },
  {
    "id": 503,
    "sku": "AT-LM 6 CM",
    "name": "LIST MOULDING",
    "bottom_price": 47840
  },
  {
    "id": 504,
    "sku": "AT-LM 4 CM",
    "name": "LIST MOULDING",
    "bottom_price": 29440
  },
  {
    "id": 505,
    "sku": "AT-KS 34 UK 10 CM X 5 CM",
    "name": "KISI PARTISI",
    "bottom_price": 98348
  },
  {
    "id": 506,
    "sku": "AT-KS 31 UK 10 CM X 5 CM",
    "name": "KISI PARTISI",
    "bottom_price": 98348
  },
  {
    "id": 507,
    "sku": "AT-KS 121 UK 10 CM X 5 CM",
    "name": "KISI PARTISI",
    "bottom_price": 98348
  },
  {
    "id": 508,
    "sku": "AT- Y 92",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 509,
    "sku": "AT- Y 47",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 510,
    "sku": "AT- Y 34",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 511,
    "sku": "AT- Y 102 (ABU\" GLITER) - (1M)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 512,
    "sku": "AT- Y 101 (PUTIH GLITER) (1M)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 33120
  },
  {
    "id": 513,
    "sku": "AT- Y 101 (PUTIH GLITER)",
    "name": "WPC PANEL 4 STRIP",
    "bottom_price": 81696
  },
  {
    "id": 514,
    "sku": "AT- LY 24",
    "name": "PLINT L",
    "bottom_price": 81696
  },
  {
    "id": 515,
    "sku": "AT- KS121 PLAFON (4CM X 4,5CM)",
    "name": "KISI-KISI PLAFON",
    "bottom_price": 68632
  },
  {
    "id": 516,
    "sku": "AT- KS 34 PLAFON (5 CM X 9 CM)",
    "name": "KISI-KISI PLAFON",
    "bottom_price": 98348
  },
  {
    "id": 517,
    "sku": "AT- KS 34 PLAFON (4CM X 4,5CM)",
    "name": "KISI-KISI PLAFON",
    "bottom_price": 68632
  },
  {
    "id": 518,
    "sku": "AT- KS 31 PLAFON (5 CM X 9 CM)",
    "name": "KISI-KISI PLAFON",
    "bottom_price": 98348
  },
  {
    "id": 519,
    "sku": "AT- KS 31 PLAFON (4CM X 4,5CM)",
    "name": "KISI-KISI PLAFON",
    "bottom_price": 68632
  },
  {
    "id": 520,
    "sku": "AT- KS 121 PLAFON(5 CM X 9 CM)",
    "name": "KISI-KISI PLAFON",
    "bottom_price": 98348
  },
  {
    "id": 521,
    "sku": "AT- KL 8273",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 522,
    "sku": "AT- KL 8088",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 523,
    "sku": "AT- DY 022 - (1.45M)",
    "name": "PVC MARBLE",
    "bottom_price": 256588
  },
  {
    "id": 524,
    "sku": "AT- DY 022",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 525,
    "sku": "AT- 8047A",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 526,
    "sku": "AT- 8038A",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 527,
    "sku": "AT- 8006T (1,22M X 1,45M)",
    "name": "PVC MARBLE",
    "bottom_price": 394018
  },
  {
    "id": 528,
    "sku": "AT- 8006T",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 529,
    "sku": "AT- 002 HITAM SERAT PUTIH",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 530,
    "sku": "AT KS 02 UK 4 CM X 5 CM",
    "name": "KISI PARTISI",
    "bottom_price": 68632
  },
  {
    "id": 531,
    "sku": "AT DY 03",
    "name": "AT DECKING FLOOR",
    "bottom_price": 200468
  },
  {
    "id": 532,
    "sku": "AT DY 02",
    "name": "AT DECKING FLOOR",
    "bottom_price": 200468
  },
  {
    "id": 533,
    "sku": "AT DY 01",
    "name": "AT DECKING FLOOR",
    "bottom_price": 200468
  },
  {
    "id": 534,
    "sku": "AT 8041A",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 535,
    "sku": "AT - PVCB 01 - SILVER (1,45M)",
    "name": "PVC BOARD SILVER DOVE",
    "bottom_price": 207690
  },
  {
    "id": 536,
    "sku": "AT - MIXED TEAK (GANDA) 1,5M",
    "name": "WPC PANEL OUTDOOR GANDA WARNA MIXED TEAK",
    "bottom_price": 483000
  },
  {
    "id": 537,
    "sku": "AT - KL 8273 (1,45M)",
    "name": "PVC MARBLE",
    "bottom_price": 787877
  },
  {
    "id": 538,
    "sku": "AT - 8056-1A",
    "name": "PVC MARBLE",
    "bottom_price": 355856
  },
  {
    "id": 539,
    "sku": "AT - 002 (1,45M)",
    "name": "PVC MARBLE",
    "bottom_price": 256588
  },
  {
    "id": 540,
    "sku": "AO222 PVC SHEET(50M X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 736000
  },
  {
    "id": 541,
    "sku": "AO222 PVC SHEET(25CM X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 736000
  },
  {
    "id": 542,
    "sku": "AO220 PVC SHEET (25CM X120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 9200
  },
  {
    "id": 543,
    "sku": "AO217 PVC SHEET(50 M X 120 CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (ROLLAN)",
    "bottom_price": 9200
  },
  {
    "id": 544,
    "sku": "AO217 PVC SHEET(25CM X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 445527
  },
  {
    "id": 545,
    "sku": "AO216 PVC SHEET(50M X 120 CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (ROLLAN)",
    "bottom_price": 736000
  },
  {
    "id": 546,
    "sku": "AO216 PVC SHEET (25CM X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 157156
  },
  {
    "id": 547,
    "sku": "AO 232 PVC SHEET (25CM X125CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 110860
  },
  {
    "id": 548,
    "sku": "AO 232 PVC SHEET (120CM X 50M)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 625048
  },
  {
    "id": 549,
    "sku": "AO 220 PVC SHEET (50M X 120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE (ROLLAN)",
    "bottom_price": 736000
  },
  {
    "id": 550,
    "sku": "AO 215 PVC SHEET(120CM X 25CM)",
    "name": "PVC SHEET MARBLE FURNITURE",
    "bottom_price": 91216
  },
  {
    "id": 551,
    "sku": "AO 211 PVC SHEET (25CM X120CM)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 1264746
  },
  {
    "id": 552,
    "sku": "AO 211 PVC SHEET (120CM X 50M)",
    "name": "PVC SHEET MARBLE STICKER FURNITURE",
    "bottom_price": 716238
  },
  {
    "id": 553,
    "sku": "A56055 (78)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 816960
  },
  {
    "id": 554,
    "sku": "A-161707 (39)",
    "name": "CHLOE",
    "bottom_price": 197009
  },
  {
    "id": 555,
    "sku": "A-161702 (40)",
    "name": "CHLOE",
    "bottom_price": 828942
  },
  {
    "id": 556,
    "sku": "A-161507 (26)",
    "name": "CH",
    "bottom_price": 39402
  },
  {
    "id": 557,
    "sku": "A-161501 (30)",
    "name": "CH",
    "bottom_price": 197009
  },
  {
    "id": 558,
    "sku": "A-160912 (89)",
    "name": "CH (katalog besar dan Kecil -  style beda Warna )",
    "bottom_price": 118205
  },
  {
    "id": 559,
    "sku": "A-160906 (88)",
    "name": "CH",
    "bottom_price": 124200
  },
  {
    "id": 560,
    "sku": "A-160105 (96)",
    "name": "CHLOE",
    "bottom_price": 1077679
  },
  {
    "id": 561,
    "sku": "A-160103 (95)",
    "name": "CHLOE",
    "bottom_price": 880988
  },
  {
    "id": 562,
    "sku": "952202 (47)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 440128
  },
  {
    "id": 563,
    "sku": "951704 (17)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 165677
  },
  {
    "id": 564,
    "sku": "951405 (53)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 440128
  },
  {
    "id": 565,
    "sku": "951404 (54)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 385112
  },
  {
    "id": 566,
    "sku": "951203 (38)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 385296
  },
  {
    "id": 567,
    "sku": "950501 (42)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 78804
  },
  {
    "id": 568,
    "sku": "920802 (14)",
    "name": "GE",
    "bottom_price": 78804
  },
  {
    "id": 569,
    "sku": "920706 (48)",
    "name": "GE",
    "bottom_price": 354616
  },
  {
    "id": 570,
    "sku": "920704 (47)",
    "name": "GE",
    "bottom_price": 1103249
  },
  {
    "id": 571,
    "sku": "920209 (81)",
    "name": "GE",
    "bottom_price": 118205
  },
  {
    "id": 572,
    "sku": "920094 (2)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 440128
  },
  {
    "id": 573,
    "sku": "920093 (3)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 440128
  },
  {
    "id": 574,
    "sku": "920063 (55)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 93321
  },
  {
    "id": 575,
    "sku": "920061 (56)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 157607
  },
  {
    "id": 576,
    "sku": "910144 (58)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 440128
  },
  {
    "id": 577,
    "sku": "910141 (60)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 440128
  },
  {
    "id": 578,
    "sku": "910101 (12)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 132147
  },
  {
    "id": 579,
    "sku": "8041A UKR 1.22M X 1.45M",
    "name": "PVC MARBLE",
    "bottom_price": 197009
  },
  {
    "id": 580,
    "sku": "80141A UKR 1.22M X 1.45M",
    "name": "PVC MARBEL",
    "bottom_price": 315531
  },
  {
    "id": 581,
    "sku": "71141 (26)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 256864
  },
  {
    "id": 582,
    "sku": "71113 (27)",
    "name": "WALLPAPER DELAPAN",
    "bottom_price": 110452
  },
  {
    "id": 583,
    "sku": "191602 (86)",
    "name": "GE",
    "bottom_price": 1810560
  },
  {
    "id": 584,
    "sku": "190908 (83)",
    "name": "GREEN 8 CITY",
    "bottom_price": 157607
  },
  {
    "id": 585,
    "sku": "190905 (88)",
    "name": "GREEN 8 CITY",
    "bottom_price": 472821
  },
  {
    "id": 586,
    "sku": "190701 (69)",
    "name": "GREEN 8 CITY",
    "bottom_price": 513728
  },
  {
    "id": 587,
    "sku": "190607 (74)",
    "name": "GE",
    "bottom_price": 651176
  },
  {
    "id": 588,
    "sku": "05 PENUTUP LIST PLANK ABU\"MUDA",
    "name": "AKSESORIS LIST PLANK ALUMUNIUM",
    "bottom_price": 343326
  },
  {
    "id": 589,
    "sku": "05 PENUTUP LIST PLANK ABU\" TUA",
    "name": "AKSESORIS LIST PLANK ALUMUNIUM",
    "bottom_price": 28318
  },
  {
    "id": 590,
    "sku": "04 KLIP LIST PLANK ALUMUNIUM",
    "name": "AKSESORIS LIST PLANK ALUMUNIUM",
    "bottom_price": 287472
  },
  {
    "id": 591,
    "sku": "03 CONNECTOR DALAM ABU\" TUA",
    "name": "AKSESORIS LIST PALNK ALUMUNIUM",
    "bottom_price": 15508
  },
  {
    "id": 592,
    "sku": "03 CONNECTOR DALAM ABU\" MUDA",
    "name": "AKSESORIS LIST PLANK ALUMUNIUM",
    "bottom_price": 275330
  },
  {
    "id": 593,
    "sku": "02 CONNECTOR LUAR ABU\" MUDA",
    "name": "AKSESORIS LIST PLANK ALUMUNIUM",
    "bottom_price": 211600
  },
  {
    "id": 594,
    "sku": "01 MIDDLE ABU\" MUDA",
    "name": "AKSESORIS LIST PLANK ALUMUNIUM",
    "bottom_price": 408395
  },
  {
    "id": 595,
    "sku": "01 MIDDLE",
    "name": "AKSESORIS LIST PLANK ALUMUNIUM",
    "bottom_price": 15508
  },
  {
    "id": 596,
    "sku": "AT-PVCB 03 BROWNZE(MIROR)1,45M",
    "name": "PVC BOARD MIRROR BROWNZE",
    "bottom_price": 274620
  },
  {
    "id": 597,
    "sku": "AT-PVCB 13 BLACK (1,45M)",
    "name": "PVC BOARD MIRROR BLACK",
    "bottom_price": 274620
  },
  {
    "id": 598,
    "sku": "AT-PVCB 18 PINK (MIRROR) 1,45M",
    "name": "PVC BOARD MIRROR PINK",
    "bottom_price": 274620
  },
  {
    "id": 599,
    "sku": "WB X- 042",
    "name": "WALLBOARD 8MM 1DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 600,
    "sku": "WB X- 99",
    "name": "WALLBOARD 8 MM ISI 1 DUS 8",
    "bottom_price": 107456
  },
  {
    "id": 601,
    "sku": "WB X-06",
    "name": "WALLBOARD 8 MM 1DUS ISI 8",
    "bottom_price": 107456
  },
  {
    "id": 602,
    "sku": "WB XS 042",
    "name": "WALLBOARD",
    "bottom_price": 107456
  },
  {
    "id": 603,
    "sku": "WB XS 045",
    "name": "WALLBOARD",
    "bottom_price": 107456
  },
  {
    "id": 604,
    "sku": "WB XS 058",
    "name": "WALLBOARD",
    "bottom_price": 107456
  },
  {
    "id": 605,
    "sku": "WB XS 062",
    "name": "WALLBOARD",
    "bottom_price": 107456
  },
  {
    "id": 606,
    "sku": "WB XS 063",
    "name": "WALLBOARD",
    "bottom_price": 107456
  },
  {
    "id": 607,
    "sku": "WB ATX - 035 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 608,
    "sku": "WB ATX - 037 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 609,
    "sku": "WB ATX - 039 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 610,
    "sku": "WB ATX - 042 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 611,
    "sku": "WB ATX - 043 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 612,
    "sku": "WB ATX - 045 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 613,
    "sku": "WB ATX - 058 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 614,
    "sku": "WB ATX - 06 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10 (1,5 METER)",
    "bottom_price": 68816
  },
  {
    "id": 615,
    "sku": "WB ATX - 082 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 616,
    "sku": "WB ATX - 099 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 617,
    "sku": "WB ATX - 82 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 618,
    "sku": "WB ATX - A207 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 619,
    "sku": "WB ATX - A209 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 620,
    "sku": "WB ATX - A228 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 10",
    "bottom_price": 68816
  },
  {
    "id": 621,
    "sku": "WB SR X 809 (1,5 M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 622,
    "sku": "WB SR-X 03 (1,5 M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 623,
    "sku": "WB SR-X 109 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 624,
    "sku": "WB SR-X 212 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 625,
    "sku": "WB SRX- 06 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 626,
    "sku": "WB SRX- 106 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 627,
    "sku": "WB SRX- 340 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 628,
    "sku": "WB SRX- 81 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 629,
    "sku": "WB SRX- 88 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 630,
    "sku": "WB SRX-08 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 631,
    "sku": "WB SRX-082 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 632,
    "sku": "WB SRX-172 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 633,
    "sku": "WB SRX-436 (1,5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 634,
    "sku": "WB X - 029 (1,5meter)",
    "name": "WALLBOARD 8 MM",
    "bottom_price": 68816
  },
  {
    "id": 635,
    "sku": "WB X - 032 (1,5 METER)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 636,
    "sku": "WB X - 035 (1,5m)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 637,
    "sku": "WB X - 037 (1,5METER)",
    "name": "WALLBOARD 8 MM 1DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 638,
    "sku": "WB X - 043 (1,5meter)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 639,
    "sku": "WB X - 045 (1,5M)",
    "name": "WALLBOARD",
    "bottom_price": 68816
  },
  {
    "id": 640,
    "sku": "WB X - 058 (1.5M)",
    "name": "WALLBOARD 8 MM 1 DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 641,
    "sku": "WB X - 06 (1,5 METER)",
    "name": "WALLBOARD 8MM 1DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 642,
    "sku": "WB X- 042 - (1,5M)",
    "name": "WALLBOARD 8MM 1DUS ISI 8",
    "bottom_price": 68816
  },
  {
    "id": 643,
    "sku": "WB X- 99 (1.5M)",
    "name": "WALLBOARD 8 MM ISI 1 DUS 8",
    "bottom_price": 68816
  },
  {
    "id": 644,
    "sku": "WB XS 042 (1,5M)",
    "name": "WALLBOARD",
    "bottom_price": 68816
  },
  {
    "id": 645,
    "sku": "WB XS 045 (1,5M)",
    "name": "WALLBOARD",
    "bottom_price": 68816
  },
  {
    "id": 646,
    "sku": "WB XS 058 (1,5M)",
    "name": "WALLBOARD",
    "bottom_price": 68816
  },
  {
    "id": 647,
    "sku": "WB XS 062 (1,5M)",
    "name": "WALLBOARD",
    "bottom_price": 68816
  },
  {
    "id": 648,
    "sku": "WB XS 063 (1,5meter)",
    "name": "WALLBOARD",
    "bottom_price": 68816
  }
];
    for (const p of pData) {
        await knex('products').insert(p).onConflict('sku').merge();
    }
    console.log('✅ Synchronized 648 products');
  }

  // Seed Users
  const uData = [
  {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@glory.com",
    "password": "$2b$10$/CGuPMpivLNazA3ZoQZ4JesIuSh30dtTSIcBaX5bnGhD51zQkmsse",
    "team": "IT Division",
    "role": "super_admin",
    "status": "Active"
  },
  {
    "id": 2,
    "name": "Tiara",
    "email": "tiara@glory.com",
    "password": "$2b$10$lNZztcNvltZbRA4Yt8oAkebJzIXll2hT2QU8ARvYAjHZZmNW7p58y",
    "team": "User",
    "role": "user",
    "status": "Active"
  },
  {
    "id": 3,
    "name": "Exel",
    "email": "exel@glory.com",
    "password": "$2b$10$7AEs5st7IiB08/G/h98VnutL80RShIQvyjQWGmHqk5y.5KHlxwlWi",
    "team": "Lelang",
    "role": "user",
    "status": "Active"
  }
];
  for (const user of uData) {
    const existing = await knex('users').where({ email: user.email }).first();
    if (!existing) {
      await knex('users').insert(user);
    }
  }
  console.log('✅ Synchronized 3 users');
};
