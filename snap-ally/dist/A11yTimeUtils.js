"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.A11yTimeUtils = void 0;
/**
 * Time utility functions for formatting test durations.
 */
class A11yTimeUtils {
    /**
     * Formats milliseconds into a human-readable duration string.
     */
    static formatDuration(ms) {
        if (ms < 1000) {
            return `${ms.toFixed(0)}ms`;
        }
        const seconds = ms / 1000;
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    }
}
exports.A11yTimeUtils = A11yTimeUtils;
