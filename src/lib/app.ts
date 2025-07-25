import { getSproutIndices } from "./field";
import type { Plot } from "./plot";
import {
  type Settings,
  defaultSettings,
  saveableKeys,
  type SaveableKey,
} from "./settings";

export function stateToSearchParams(field: Plot[], settings: Settings) {
  const sprouts = getSproutIndices(field).map(String).join(".");
  const sproutSetting: { sprouts?: string } =
    sprouts.length > 0 ? { sprouts } : {};
  const settingsToSave = Object.fromEntries(
    Object.entries(settings)
      .filter(
        ([k, v]) =>
          saveableKeys.includes(k as SaveableKey) &&
          v !== defaultSettings[k as SaveableKey]
      )
      .map(([k, v]) => [k, String(v)])
  );
  return new URLSearchParams({
    ...sproutSetting,
    ...settingsToSave,
  }).toString();
}
