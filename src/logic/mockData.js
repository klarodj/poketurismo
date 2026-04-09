// Mock Data for the game world

export const NEW_CARS = [
  {
    id: 'n1',
    name: 'Fiat Punto GT 1.4',
    brand: 'Fiat',
    cv: 133,
    nm: 200,
    kg: 1000,
    driveType: 'FF',
    engineType: 'Turbo',
    km: 0,
    tireGrip: 100,
    engineHealth: 100,
    fuelCapacity: 47,
    currentFuel: 5,
    fuelType: 'Normale',
    price: 3500
  },
  {
    id: 'n2',
    name: 'VW Golf GTI Mk3 2.0 16v',
    brand: 'Volkswagen',
    cv: 150,
    nm: 180,
    kg: 1164,
    driveType: 'FF',
    engineType: 'NA',
    km: 0,
    tireGrip: 100,
    engineHealth: 100,
    fuelCapacity: 55,
    currentFuel: 5,
    fuelType: 'Normale',
    price: 5200
  },
  {
    id: 'n3',
    name: 'Alfa Romeo 145 Quadrifoglio',
    brand: 'Alfa Romeo',
    cv: 150,
    nm: 187,
    kg: 1240,
    driveType: 'FF',
    engineType: 'Twin Spark',
    km: 0,
    tireGrip: 100,
    engineHealth: 100,
    fuelCapacity: 51,
    currentFuel: 5,
    fuelType: 'Normale',
    price: 4800
  }
];

export const USED_CARS = [
  {
    id: 'u1',
    name: 'Renault Clio Williams 2.0',
    brand: 'Renault',
    cv: 150,
    nm: 175,
    kg: 990,
    driveType: 'FF',
    engineType: 'NA',
    km: 185000,
    tireGrip: 60,
    engineHealth: 80,
    fuelCapacity: 43,
    currentFuel: 10,
    fuelType: 'Normale',
    price: 2800,
    seller: 'TuningBoy88',
    date: '12 Nov 2002'
  },
  {
    id: 'u2',
    name: 'Honda Civic VTi EG6',
    brand: 'Honda',
    cv: 160,
    nm: 150,
    kg: 1080,
    driveType: 'FF',
    engineType: 'VTEC',
    km: 220000,
    tireGrip: 40,
    engineHealth: 70,
    fuelCapacity: 45,
    currentFuel: 2,
    fuelType: 'Normale',
    price: 3100,
    seller: 'VTEC_Kicker',
    date: '15 Nov 2002'
  }
];

export const TRACKS = [
  {
    id: 't1',
    name: 'Autodromo di Monza',
    weather: 'Sole',
    sections: [
      { id: 's1', name: 'Rettifilo Tribune', type: 'Rettilineo' },
      { id: 's2', name: 'Prima Variante', type: 'Chicane' },
      { id: 's3', name: 'Curva Grande', type: 'Misto' },
      { id: 's4', name: 'Variante della Roggia', type: 'Chicane' },
      { id: 's5', name: 'Curva Parabolica', type: 'Tornante' }
    ],
    opponent: {
      name: 'Rocco (Rival)',
      carName: 'Punto GT Elastica',
      // Base stats for the mock opponent
      stats: { speed: 120, acceleration: 130, turnSlow: 90, turnFast: 100, brake: 110, traction: 100 }
    },
    reward: 1500,
    xp: 500
  }
];
