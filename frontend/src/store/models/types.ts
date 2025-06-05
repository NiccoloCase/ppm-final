import { GeneralModel } from "./general";
import { NotificationModel } from "./notifications";
import { PostModel } from "./post";
import { UserModel } from "./user";
export type MergedStoreModel = GeneralModel &
  UserModel &
  PostModel &
  NotificationModel;
