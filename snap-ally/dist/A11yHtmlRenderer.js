"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.A11yHtmlRenderer = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ejs = __importStar(require("ejs"));
/**
 * Handles the rendering of HTML reports using EJS templates.
 */
class A11yHtmlRenderer {
    /**
     * Renders an HTML template and saves it to the specified file.
     * @param templateName The template file name in the templates folder.
     * @param data The data object to pass to EJS.
     * @param outputFolder The folder where the rendered file will be saved.
     * @param outputFileName The full path of the output file.
     */
    async render(templateName, data, outputFolder, outputFileName) {
        // Resolve path relative to this file (dist/A11yHtmlRenderer.js)
        const templatePath = path.join(__dirname, 'templates', templateName);
        let templateContent = '';
        try {
            templateContent = fs.readFileSync(templatePath, 'utf8');
        }
        catch {
            throw new Error(`[A11yHtmlRenderer] Template not found: ${templatePath}`);
        }
        let html = '';
        try {
            html = ejs.render(templateContent, data);
        }
        catch (error) {
            console.error(`[A11yHtmlRenderer] EJS Render Error (${templateName}):`, error);
            throw error;
        }
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }
        fs.writeFileSync(outputFileName, html);
    }
    /**
     * Converts ANSI color codes to HTML spans for nicer error display.
     */
    ansiToHtml(text) {
        const map = {
            '\u001b[30m': '<span style="color:black">',
            '\u001b[31m': '<span style="color:red">',
            '\u001b[32m': '<span style="color:green">',
            '\u001b[33m': '<span style="color:yellow">',
            '\u001b[34m': '<span style="color:blue">',
            '\u001b[35m': '<span style="color:magenta">',
            '\u001b[36m': '<span style="color:cyan">',
            '\u001b[37m': '<span style="color:white">',
            '\u001b[0m': '</span>',
            '\u001b[2m': '<span style="opacity:0.5">',
            '\u001b[22m': '</span>',
            '\u001b[39m': '</span>',
        };
        let result = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        for (const [code, tag] of Object.entries(map)) {
            result = result.split(code).join(tag);
        }
        return result;
    }
}
exports.A11yHtmlRenderer = A11yHtmlRenderer;
