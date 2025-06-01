import { ThemeProvider } from "react-bootstrap";
import "./theme.scss";
import "./bootstrap.scss";
import { useEffect, useState } from "react";
import { myConfig } from "../config";
import { IFontConfigSchema } from "../config/interfaces";
import WebFont from "webfontloader";
import { loadVariableToCSS } from "./utils";
import { useStore } from "../store";

export const loadAllFonts = (
  fontsConfig: Record<string, IFontConfigSchema>,
  onLoaded: () => void,
  onError: (font: string) => void
) => {
  const googleFonts: string[] = [];
  const customFonts = {
    urls: [] as string[],
    families: [] as string[],
  };

  for (const key in fontsConfig) {
    const font = fontsConfig[key];

    loadVariableToCSS(`${key}-font-family`, font.font_family);

    if (font.google)
      googleFonts.push(
        `${font.google.font_name}:${font.google.font_weights.join(",")}`
      );
    else if (font.custom) {
      customFonts.families.push(font.custom.font_families);
      customFonts.urls.push(
        "/assets/fonts/" + font.custom.folder_name + "/style.css"
      );
    }
  }

  if (customFonts.urls.length > 0 || customFonts.families.length > 0) {
    WebFont.load({
      google:
        googleFonts.length > 0
          ? {
              families: googleFonts,
            }
          : undefined,

      active: onLoaded,
      inactive: () => {
        googleFonts.forEach((font) => onError(font));
      },
    });
  } else onLoaded();
};

export const ThemeWrapper: React.FC<any> = ({ children }) => {
  const setIsThemeLoaded = useStore((s) => s.setIsThemeLoaded);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    if (fontsLoaded) setIsThemeLoaded(fontsLoaded);
  }, [fontsLoaded]);

  useEffect(() => {
    // IMPORTA LE VARIABILI CSS
    // -------------------------------------------------

    // Carica palette
    for (const key in myConfig.customization.global.palette) {
      const value = (myConfig.customization.global.palette as any)[key];
      if (key && value) loadVariableToCSS(key, value);
    }

    // CARICAMENTO FONTS
    loadAllFonts(
      myConfig.customization.global.fonts,
      () => {
        setFontsLoaded(true);
        console.log("Fonts caricati");
      },
      () => {
        // Anche se un font non viene caricato, il sito deve comunque funzionare
        setFontsLoaded(true);
        console.error("Errore nel caricamento del font");
      }
    );
  }, []);

  return <ThemeProvider>{fontsLoaded ? children : null}</ThemeProvider>;
};
