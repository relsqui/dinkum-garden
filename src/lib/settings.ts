export const defaultSettings = {
  debug: false,
  iterationDays: 1,
  autoHarvest: false,
  wrapWE: false,
  wrapNS: false,
};

export type Settings = typeof defaultSettings;
export type SettingKey = keyof Settings;
export type SettingWithType<T> = {
  [K in SettingKey]: Settings[K] extends T ? K : never;
}[SettingKey];

export type SaveableKey = "autoHarvest" | "wrapWE" | "wrapNS";

export type SaveableSettings = Pick<Settings, SaveableKey>
