export interface Settings {
  autoHarvest: boolean;
  wrapWE: boolean;
  wrapNS: boolean;
  debug: boolean;
}

export const defaultSettings: Settings = {
  autoHarvest: false,
  wrapWE: false,
  wrapNS: false,
  debug: false,
};

export type SettingName = keyof Settings;
