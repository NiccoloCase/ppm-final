import { create } from "zustand";
import { createGeneralStore } from "./models/general";
import { MergedStoreModel } from "./models/types";
import { createUserStore } from "./models/user";

export const useStore = create<MergedStoreModel>()((...a) => ({
  ...createGeneralStore(...a),
  ...createUserStore(...a),
}));
