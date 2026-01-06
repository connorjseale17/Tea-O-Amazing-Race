import { Waypoint } from './types';

// Core Mathematics
export const STEPS_PER_MILE = 2000;
export const TOTAL_GOAL_MILES = 4195;
export const TOTAL_GOAL_STEPS = TOTAL_GOAL_MILES * STEPS_PER_MILE;
export const MAX_USERS = 20;

// API Configuration
export const API_URL = 'http://localhost:3001/api';

// Route: Seattle -> SF -> LA -> Vegas -> Moab -> Denver -> Chicago -> Philly -> NYC
export const ROUTE_WAYPOINTS: Waypoint[] = [
  {
    name: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    fact: "Start Line! Did you know Seattle has a troll living under the Aurora Bridge?"
  },
  {
    name: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    fact: "The Golden Gate Bridge's color is officially called 'International Orange'."
  },
  {
    name: "Los Angeles, CA",
    lat: 34.0522,
    lng: -118.2437,
    fact: "LA's full name is 'El Pueblo de Nuestra Señora la Reina de los Ángeles del Río Porciúncula'."
  },
  {
    name: "Las Vegas, NV",
    lat: 36.1699,
    lng: -115.1398,
    fact: "The Luxor Las Vegas Sky Beam is the brightest light beam in the world."
  },
  {
    name: "Moab, UT",
    lat: 38.5733,
    lng: -109.5498,
    fact: "Moab is home to the stunning arches of Arches National Park."
  },
  {
    name: "Denver, CO",
    lat: 39.7392,
    lng: -104.9903,
    fact: "The 13th step of the State Capitol building is exactly one mile above sea level."
  },
  {
    name: "Chicago, IL",
    lat: 41.8781,
    lng: -87.6298,
    fact: "The Chicago River is the only river in the world that flows backwards."
  },
  {
    name: "Philadelphia, PA",
    lat: 39.9526,
    lng: -75.1652,
    fact: "Philadelphia is home to America's first zoo and first hospital."
  },
  {
    name: "New York City, NY",
    lat: 40.7128,
    lng: -74.0060,
    fact: "Finish Line! NYC has more than 800 languages spoken, making it the most linguistically diverse city."
  }
];

export const INITIAL_USERS = [];