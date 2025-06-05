import { create } from "zustand";
import { createGeneralStore } from "./models/general";
import { MergedStoreModel } from "./models/types";
import { createUserStore } from "./models/user";
import { createPostStore } from "./models/post";
import { createNotificationStore } from "./models/notifications";

export const useStore = create<MergedStoreModel>()((...a) => ({
  ...createGeneralStore(...a),
  ...createUserStore(...a),
  ...createPostStore(...a),
  ...createNotificationStore(...a),
}));
