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

export const saveableKeys = ["autoHarvest", "wrapWE", "wrapNS"] as const;
export type SaveableKey = (typeof saveableKeys)[number];

export type SaveableSettings = Pick<Settings, SaveableKey>;

export function settingsFromSearchParams() {
  const savedSettings: Partial<SaveableSettings> = Object.fromEntries(
    Array.from(new URLSearchParams(window.location.search).entries()).filter(
      ([k]) => saveableKeys.includes(k as SaveableKey)
    )
  );
  return { ...defaultSettings, ...savedSettings };
}
