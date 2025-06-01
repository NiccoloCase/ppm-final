import { ConfigSchema } from "./interfaces";

const myConfig: ConfigSchema = {
  customization: {
    global: {
      palette: {
        primary: "#e8711d",
        secondary: "#d36619",
        text_primary: "#000000",
        backgroundDark: "#1D1D1B",
        backgroundLight: "#F5F5F5",
        backgroundLightBright: "#ffff",
        darkGrey: "#404040",
        mediumGrey: "#abb7b7",
        lightGrey: "#EDD5DD",
        successGreen: "#4BB543",
        red: "#d64541",
        errorRed: "#cc0000",
        whiteSmoke: "#F5F5F5",
      },

      fonts: {
        main: {
          font_family: "Rubik,  sans-serif",
          google: {
            font_name: "Rubik",
            font_weights: [400, 500, 600, 700],
          },
        },
      },
    },
  },
};

export const palette = myConfig.customization.global.palette;
export const fonts = myConfig.customization.global.fonts;
export { myConfig as myConfig };
