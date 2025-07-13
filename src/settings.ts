export interface Settings {
    autoHarvest: boolean;
}

export const defaultSettings: Settings = {
    autoHarvest: false
}

export type SettingName = keyof Settings;
