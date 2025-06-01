import { GeneralModel } from "./general";
import { PostModel } from "./post";
import { UserModel } from "./user";
export type MergedStoreModel = GeneralModel & UserModel & PostModel;
