import { StateCreator } from "zustand";
import { MergedStoreModel } from "./types";

export interface GeneralModel {
  // valori
  isThemeLoaded: boolean;
  isDrawerOpen: boolean;
  // azioni
  setIsThemeLoaded: (isThemeLoaded: boolean) => void;
  setIsDrawerOpen: (isDrawerOpen: boolean) => void;
}

export const createGeneralStore: StateCreator<
  MergedStoreModel,
  [],
  [],
  GeneralModel
> = (set) => ({
  isThemeLoaded: false,
  isDrawerOpen: false,

  /**
   * Modifica se i font sono stati caricati
   */
  setIsThemeLoaded: (isThemeLoaded) => set({ isThemeLoaded }),
  /**
   * Modifica se il drawer è aperto
   */
  setIsDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
});
