"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-expect-error
const packager_html_1 = __importDefault(require("@parcel/packager-html"));
const plugin_1 = require("@parcel/plugin");
const posthtml_1 = __importDefault(require("posthtml"));
const CONFIG = Symbol.for("parcel-plugin-config");
const packager = packager_html_1.default[CONFIG];
async function generateSprite(symbols) {
    let sprite = '<svg aria-hidden="true" width="0" height="0" style="position:absolute">';
    symbols.forEach(symbol => {
        sprite += symbol;
    });
    sprite += "</svg>";
    return sprite;
}
exports.default = new plugin_1.Packager({
    loadConfig: packager.loadConfig,
    async package(args) {
        const { bundleGraph } = args;

        // Collect SVGs
        const svgSymbols = new Set();
        const svgBundles = {};
        bundleGraph.getBundles().forEach(bundle => {
            // Fill svgBundles which is used to replace href in html `use` tag
            const entryAssets = bundle.getEntryAssets();
            const svgAsset = entryAssets.find(asset => asset.meta.type === "svg-sprite");
            if (svgAsset) {
                svgBundles[`${bundle.name}`] = `#${svgAsset.meta.svgId}`;
            }
            // Fill svgSynbols which is used to generate svg sprite
            bundle.traverseAssets(asset => {
                if (asset.meta.type === "svg-sprite" &&
                    typeof asset.meta.svgSymbol === "string") {
                    svgSymbols.add(asset.meta.svgSymbol);
                }
            });
        });
        const svgSprite = await generateSprite(svgSymbols);
        const injectSprite = tree => {
            tree.match({ tag: "body" }, node => {
                node.content?.splice(0, 0, svgSprite);
                return node;
            });
        };

        console.log(svgBundles)
        // If an svg is imported from an html file
        // we replace xlink:href attribute by the symbol id
        const replaceUseHref = tree => {
            tree.match({ tag: "svg" }, node => {
                const svgUseTagElement = node.content?.find(child => typeof child !== "string" && child.tag === "use");
                if (svgUseTagElement) {
                    const href =
                    // @ts-expect-error
                    svgUseTagElement.attrs.href ||
                        // @ts-expect-error
                        svgUseTagElement.attrs["xlink:href"];

                    const newHref = href.indexOf('/') == 0 ? href.substring(1) : href;

                    const symbolId = href ? svgBundles[newHref] : undefined;
                    if (symbolId) {
                        // @ts-expect-error
                        delete svgUseTagElement.attrs.href;
                        // @ts-expect-error
                        svgUseTagElement.attrs["xlink:href"] = symbolId;
                    }
                }
                return node;
            });
        };
        // run parcel html packager
        let contents = (await packager.package(args)).contents;
        // add svg sprite

        const proceedHtml = await (0, posthtml_1.default)([injectSprite, replaceUseHref]).process(contents);
        contents = proceedHtml.html;
        return {
            contents: contents,
        };
    },
});
