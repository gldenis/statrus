"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-expect-error
const hash_1 = require("@parcel/hash");
const plugin_1 = require("@parcel/plugin");
const svgo_1 = require("svgo");
function generateSvgSymbol(id, code) {
    let symbol = code.replace('xmlns="http://www.w3.org/2000/svg"', "");
    symbol = symbol.replace(/xml:space="\w+"/, "");
    symbol = symbol.replace("<svg", `<symbol id="${id}"`);
    symbol = symbol.replace("</svg", "</symbol");
    return symbol;
}
exports.default = new plugin_1.Transformer({
    async loadConfig() {
        const userConfig = await (0, svgo_1.loadConfig)();
        const svgoConfig = userConfig ?? {};
        return {
            svgo: svgoConfig,
        };
    },
    async transform({ asset, config }) {
        if (asset.type === "svg") {
            // @ts-expect-error
            const svgoConfig = config.svgo;
            const svgCode = await asset.getCode();
            const optimizedSvg = (0, svgo_1.optimize)(svgCode, svgoConfig).data;
            const svgId = (0, hash_1.hashString)(optimizedSvg);
            const svgSymbol = generateSvgSymbol(svgId, optimizedSvg);
            const code = `export default "#${svgId}";`;
            asset.type = "js";
            asset.setCode(code);
            asset.meta.svgId = svgId;
            asset.meta.svgSymbol = svgSymbol;
            asset.meta.type = "svg-sprite";
        }
        else {
            console.warn("parcel-transformer-svg-sprite works only with .svg files");
        }
        return [asset];
    },
});
