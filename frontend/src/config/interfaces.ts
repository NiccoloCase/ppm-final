export interface IGoogleFontSchema {
  font_name: string;
  font_weights: number[];
}

export interface IFontConfigSchema {
  font_family: string;
  google?: IGoogleFontSchema;
  custom?: {
    folder_name: string;
    font_families: string;
  };
}

export type IResponsiveObjectSchema<T> =
  | T
  | { value: T; breakpoint?: string }[];

export enum IBackgroundTypeConfigSchema {
  IMAGE = "image",
  VIDEO = "video",
  STATIC_COLOR = "static_color",
}

export interface IBackgroundConfigSchema {
  background_type: IBackgroundTypeConfigSchema;
  background_src?: string;
  background_overlay?: string;
  background_overlay_blur_radius?: string;
  static_color?: string;
}

export interface ConfigSchema {
  customization: {
    global: {
      palette: {
        primary: string;
        secondary: string;
        text_primary: string;
        backgroundDark: string;
        backgroundLight: string;
        backgroundLightBright: string;
        darkGrey: string;
        mediumGrey: string;
        lightGrey: string;
        successGreen: string;
        red: string;
        errorRed: string;
        whiteSmoke: string;
      };
      fonts: {
        [key: string]: IFontConfigSchema;
      };
    };
  };
}
