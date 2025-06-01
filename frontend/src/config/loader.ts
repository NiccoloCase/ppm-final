import { myConfig } from ".";
import { validateConfiguration } from "./schema";

export const initConfig = () => {
  validateConfiguration(myConfig);
};
