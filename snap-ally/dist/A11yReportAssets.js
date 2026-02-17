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
exports.A11yReportAssets = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Utilities for managing and copying report assets like videos and screenshots.
 */
class A11yReportAssets {
    /**
     * Copies a file from source to a destination folder.
     */
    copyToFolder(destFolder, srcPath, fileName) {
        if (!srcPath || !fs.existsSync(srcPath)) {
            return '';
        }
        const name = fileName || path.basename(srcPath);
        const destFile = path.join(destFolder, name);
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        fs.copyFileSync(srcPath, destFile);
        return name;
    }
    /**
     * Copies the test video if available.
     * Includes a small retry to ensure Playwright has finished flushing the file.
     */
    async copyTestVideo(result, destFolder) {
        const videoAttachments = result.attachments.filter(a => a.name === 'video');
        let bestVideo = null;
        let maxSize = -1;
        for (const attachment of videoAttachments) {
            if (!attachment.path)
                continue;
            // Retry logic: Wait for file to exist (up to 2 seconds)
            let exists = fs.existsSync(attachment.path);
            let attempts = 0;
            while (!exists && attempts < 10) {
                await new Promise(r => setTimeout(r, 200));
                exists = fs.existsSync(attachment.path);
                attempts++;
            }
            if (exists) {
                try {
                    const size = fs.statSync(attachment.path).size;
                    if (size > maxSize) {
                        maxSize = size;
                        bestVideo = attachment.path;
                    }
                }
                catch (err) {
                    console.error(`[SnapAlly] Error checking video stats: ${err}`);
                }
            }
            else {
                console.warn(`[SnapAlly] Video attachment path found but file missing: ${attachment.path}`);
            }
        }
        if (bestVideo) {
            try {
                return this.copyToFolder(destFolder, bestVideo);
            }
            catch (e) {
                console.error(`[SnapAlly] Failed to copy video: ${e}`);
                return path.basename(bestVideo);
            }
        }
        return '';
    }
    /**
     * Copies all screenshots found in the test attachments.
     */
    copyScreenshots(result, destFolder) {
        return result.attachments
            .filter(a => a.name === 'screenshot')
            .map(a => {
            if (a.path) {
                return this.copyToFolder(destFolder, a.path);
            }
            else if (a.body) {
                return this.writeBuffer(destFolder, `screenshot-${Date.now()}.png`, a.body);
            }
            return '';
        })
            .filter(path => path !== '');
    }
    /**
     * Copies all PNG attachments to the report folder and returns their new names.
     */
    copyPngAttachments(result, destFolder) {
        return result.attachments
            .filter(a => a.name.endsWith('.png') && a.name !== 'screenshot')
            .map(a => {
            let name = '';
            if (a.path) {
                name = this.copyToFolder(destFolder, a.path, a.name);
            }
            else if (a.body) {
                name = this.writeBuffer(destFolder, a.name, a.body);
            }
            return name ? { path: name, name: a.name } : null;
        })
            .filter((item) => item !== null);
    }
    /**
     * Copies all other attachments (traces, logs, etc.) to the report folder.
     */
    copyAllOtherAttachments(result, destFolder) {
        const excludedNames = ['screenshot', 'video', 'A11y'];
        return result.attachments
            .filter(a => !excludedNames.includes(a.name) && !a.name.endsWith('.png'))
            .map(a => {
            let name = '';
            if (a.path) {
                name = this.copyToFolder(destFolder, a.path, a.name);
            }
            else if (a.body) {
                name = this.writeBuffer(destFolder, a.name, a.body);
            }
            return name ? { path: name, name: a.name } : null;
        })
            .filter((item) => item !== null);
    }
    /**
     * Writes a buffer to a file in the destination folder.
     */
    writeBuffer(destFolder, fileName, buffer) {
        if (!fs.existsSync(destFolder)) {
            fs.mkdirSync(destFolder, { recursive: true });
        }
        const destFile = path.join(destFolder, fileName);
        fs.writeFileSync(destFile, buffer);
        return fileName;
    }
}
exports.A11yReportAssets = A11yReportAssets;
