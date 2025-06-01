/**
 * Formatta una chiave in kebab-case
 * @param key
 * @returns
 */
export const formatKeyToKebabCase = (key: string) => {
  return key
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Aggiunge un trattino prima dei caratteri maiuscoli
    .replace(/\s+/g, "-") // Sostituisce gli spazi con trattini
    .replace(/_/g, "-") // sostituisce _ con -
    .toLowerCase(); // Converte tutto in minuscolo
};

/**
 * Carica una variabile CSS
 * @param key
 * @param value
 */
export const loadVariableToCSS = (key: string, value: string) => {
  const formattedKey = formatKeyToKebabCase(key);
  document.documentElement.style.setProperty("--" + formattedKey, value);

  return formattedKey;
};
