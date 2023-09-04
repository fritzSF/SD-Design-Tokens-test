const StyleDictionary = require("style-dictionary");

// Look for args passed on the command line
const args = require("minimist")(process.argv.slice(2));

// If no theme arg was passed, default to Primary theme
const theme = args.theme ? args.theme : "primary";

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
            `tokens/Components/**/*.json`,
            `tokens/Theme/${theme}.json`,
        ],
        platforms: {
            css: {
                transformGroup: "css",
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