const StyleDictionary = require("style-dictionary");
const { registerTransforms } = require('@tokens-studio/sd-transforms');

// Look for args passed on the command line
const args = require("minimist")(process.argv.slice(2));

// If no theme arg was passed, default to Primary theme
const theme = args.theme ? args.theme : "primary";

// format helpers from style-dictionary
const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

// sd-transforms, 2nd parameter for options can be added
// See docs: https://github.com/tokens-studio/sd-transforms
registerTransforms(StyleDictionary);

// example value transform, which just returns the token as is
StyleDictionary.registerTransform({
    type: "value",
    name: "myCustomTransform",
    matcher: (token) => { },
    transformer: (token) => {
        return token;
    }
})

// example css format
StyleDictionary.registerFormat({
    name: 'customSDFormat',
    formatter: function ({ dictionary, file, options }) {
        const { outputReferences } = options;
        return `${fileHeader({ file })}:root {
            ${formattedVariables(
            {
                format: 'css',
                dictionary,
                outputReferences
            }
        )}}`;
    }
});

console.log(`🚧 Compiling tokens with the ${theme.toUpperCase()} theme`);

/**
 * Generate a Theme-Specific Config
 * This accepts a theme parameter, which is used to control which set of
 * tokens to compile, and to define theme-specific compiled output.
 * @param {string} theme
 */
const getStyleDictionaryConfig = (theme) => {
    return {
        log: "warn",
        source: [
            `tokens/core.json`,
            `tokens/Theme/${theme}.json`,
            `tokens/Components/**/*.json`,
        ],
        platforms: {
            css: {
                transformGroup: "tokens-studio",
                buildPath: `build/css/`,
                files: [
                    {
                        destination: `${theme}.css`,
                        format: "css/variables",
                    },
                ],
            },
        },
    };
};

// APPLY THE CONFIGURATION
// IMPORTANT: the registration of custom transforms
// needs to be done _before_ applying the configuration
const StyleDictionaryExtended = StyleDictionary.extend(
    getStyleDictionaryConfig(theme)
);

// BUILD ALL THE PLATFORMS
StyleDictionaryExtended.buildAllPlatforms();