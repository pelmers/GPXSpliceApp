export const SPEED_UNITS = {
  KMH: "km/h",
  MPH: "mi/h",
} as const;

export const DISTANCE_UNITS = {
  KM: "km",
  MI: "mi",
} as const;

export const TEMP_UNITS = {
  C: "°C",
  F: "°F",
} as const;

export const ELEVATION_UNITS = {
  M: "m",
  FT: "ft",
} as const;

export type SpeedKey = keyof typeof SPEED_UNITS;
export type DistanceKey = keyof typeof DISTANCE_UNITS;
export type TempKey = keyof typeof TEMP_UNITS;
export type ElevationKey = keyof typeof ELEVATION_UNITS;

export type SpeedUnit = (typeof SPEED_UNITS)[SpeedKey];
export type DistanceUnit = (typeof DISTANCE_UNITS)[DistanceKey];
export type TempUnit = (typeof TEMP_UNITS)[TempKey];
export type ElevationUnit = (typeof ELEVATION_UNITS)[ElevationKey];

export type SavedSettings = {
  speedUnit: SpeedUnit;
  distanceUnit: DistanceUnit;
  tempUnit: TempUnit;
  elevationUnit: ElevationUnit;
};

export const DefaultSettings: SavedSettings = {
  speedUnit: SPEED_UNITS.KMH,
  distanceUnit: DISTANCE_UNITS.KM,
  tempUnit: TEMP_UNITS.C,
  elevationUnit: ELEVATION_UNITS.M,
};

type AnyUnit = SpeedUnit | DistanceUnit | TempUnit | ElevationUnit;

export function convert(
  value: number,
  from: AnyUnit,
  settings: SavedSettings,
): { value: number; unit: AnyUnit } {
  switch (from) {
    case SPEED_UNITS.KMH:
    case SPEED_UNITS.MPH:
      return {
        value: convertSpeed(value, from, settings.speedUnit),
        unit: settings.speedUnit,
      };
    case DISTANCE_UNITS.KM:
    case DISTANCE_UNITS.MI:
      return {
        value: convertDistance(value, from, settings.distanceUnit),
        unit: settings.distanceUnit,
      };
    case TEMP_UNITS.C:
    case TEMP_UNITS.F:
      return {
        value: convertTemp(value, from, settings.tempUnit),
        unit: settings.tempUnit,
      };
    case ELEVATION_UNITS.M:
    case ELEVATION_UNITS.FT:
      return {
        value: convertElevation(value, from, settings.elevationUnit),
        unit: settings.elevationUnit,
      };
  }
}

function convertSpeed(value: number, from: SpeedUnit, to: SpeedUnit): number {
  if (from === to) {
    return value;
  }

  if (from === "km/h") {
    return value / 1.609;
  }

  return value * 1.609;
}

function convertDistance(
  value: number,
  from: DistanceUnit,
  to: DistanceUnit,
): number {
  if (from === to) {
    return value;
  }

  if (from === "km") {
    return value / 1.609;
  }

  return value * 1.609;
}

function convertElevation(
  value: number,
  from: ElevationUnit,
  to: ElevationUnit,
): number {
  if (from === to) {
    return value;
  }

  if (from === "m") {
    return value / 3.281;
  }

  return value * 3.281;
}

function convertTemp(value: number, from: TempUnit, to: TempUnit): number {
  if (from === to) {
    return value;
  }

  if (from === "°C") {
    return (value * 9) / 5 + 32;
  }

  return ((value - 32) * 5) / 9;
}
