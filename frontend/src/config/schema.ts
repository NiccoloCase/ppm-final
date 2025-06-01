import joi from "joi";
import { ConfigSchema } from "./interfaces";

const GoogleFontSchema = joi.object({
  font_name: joi.string().required(),
  font_weights: joi.array().items(joi.number()).required(),
});

const CustomFontSchema = joi.object({
  folder_name: joi.string().required(),
  font_families: joi.string().required(),
});

const FontConfigSchema = joi.object({
  font_family: joi.string().required(),
  google: GoogleFontSchema,
  custom: CustomFontSchema,
});

export const configSchemaValidation = joi.object({
  customization: joi
    .object({
      global: joi
        .object({
          palette: {
            primary: joi.string().required(),
            secondary: joi.string().required(),
            text_primary: joi.string().required(),
            backgroundDark: joi.string().required(),
            backgroundLight: joi.string().required(),
            backgroundLightBright: joi.string().required(),
            darkGrey: joi.string().required(),
            mediumGrey: joi.string().required(),
            lightGrey: joi.string().required(),
            successGreen: joi.string().required(),
            red: joi.string().required(),
            errorRed: joi.string().required(),
            whiteSmoke: joi.string().required(),
          },
          fonts: joi.object({
            main: FontConfigSchema,
            typewriter: FontConfigSchema,
          }),
        })
        .required(),
    })
    .required(),

  validation: joi.object({
    user: joi.object({
      username: joi.object({
        length: joi.object({
          min: joi.number().required(),
          max: joi.number().required(),
        }),
        regex: joi.object({
          test: joi.func().required(),
        }),
      }),
    }),
    media: joi.object({
      profilePicture: joi.object(),
      eventImage: joi.object(),
      organizerImage: joi.object(),
    }),
  }),
});

export const validateConfiguration = (config: Partial<ConfigSchema>) => {
  const { error } = configSchemaValidation.validate(config);
  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  } else return true;
};
