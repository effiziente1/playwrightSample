import { Page, Locator, TestInfo } from '@playwright/test';
export interface A11yScannerOptions {
    /** Specific selector or locator to include in the scan. */
    include?: string | Locator;
    /** Alias for include. */
    box?: string | Locator;
    /** Whether to log violations to the console. @default true */
    verbose?: boolean;
    /** Alias for verbose. */
    consoleLog?: boolean;
    /** Specific Axe rules to enable or disable. */
    rules?: Record<string, {
        enabled: boolean;
    }>;
    /** Specific WCAG tags to check (e.g., ['wcag2a', 'wcag2aa']). */
    tags?: string[];
    /** Any other Axe-core options to pass to the builder. */
    axeOptions?: Record<string, unknown>;
}
/**
 * Performs an accessibility audit using Axe and Lighthouse.
 */
export declare function scanA11y(page: Page, testInfo: TestInfo, options?: A11yScannerOptions): Promise<void>;
/** Alias for backward compatibility */
export declare const checkAccessibility: typeof scanA11y;
