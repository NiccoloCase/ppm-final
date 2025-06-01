import { create } from "zustand";
import { createGeneralStore } from "./models/general";
import { MergedStoreModel } from "./models/types";

export const useStore = create<MergedStoreModel>()((...a) => ({
  ...createGeneralStore(...a),
}));
