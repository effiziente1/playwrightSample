import AxeBuilder from '@axe-core/playwright';
import { Page, Locator, expect, TestInfo } from '@playwright/test';
import { A11yAuditOverlay } from './A11yAuditOverlay';
import { A11yError, ReportData, Target, Severity } from './models';


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
    rules?: Record<string, { enabled: boolean }>;
    /** Specific WCAG tags to check (e.g., ['wcag2a', 'wcag2aa']). */
    tags?: string[];
    /** Any other Axe-core options to pass to the builder. */
    axeOptions?: Record<string, unknown>;
}

/**
 * Performs an accessibility audit using Axe and Lighthouse.
 */
export async function scanA11y(page: Page, testInfo: TestInfo, options: A11yScannerOptions = {}) {
    const verbose = options.verbose ?? true;
    const overlay = new A11yAuditOverlay(page, page.url());
    
    // Configure Axe
    let axeBuilder = new AxeBuilder({ page });
    
    if (options.include) {
        if (typeof options.include === 'string') {
            axeBuilder = axeBuilder.include(options.include);
        }
    }

    if (options.rules) {
        axeBuilder = axeBuilder.options({ rules: options.rules });
    }

    if (options.tags) {
        axeBuilder = axeBuilder.withTags(options.tags);
    }

    if (options.axeOptions) {
        axeBuilder = axeBuilder.options(options.axeOptions);
    }

    const axeResults = await axeBuilder.analyze();

    const violationCount = axeResults.violations.length;
    
    if (verbose && violationCount > 0) {
        console.log(`\n[A11yScanner] Violations found: ${violationCount}`);
        axeResults.violations.forEach((v, i) => {
            console.log(`  ${i + 1}. ${v.id} [${v.impact}] - ${v.help}`);
        });
    }

    // Fail the test if violations found (softly)
    expect.soft(violationCount, `Accessibility audit failed with ${violationCount} violations.`).toBe(0);

    // Run Axe Audit
    const errors: A11yError[] = [];
    const colorMap: Record<string, string> = {
        minor: '#0ea5e9',    // Ocean Blue
        moderate: '#f59e0b', // Amber/Honey
        serious: '#ea580c',  // Deep Orange
        critical: '#dc2626'  // Power Red
    };

    // Process violations for the report
    for (const violation of axeResults.violations) {
        let errorIdx = 0;
        const targets: Target[] = [];
        const severityColor = colorMap[violation.impact || ''] || '#757575';
        
        for (const node of violation.nodes) {
            for (const selector of node.target) {
                const elementSelector = selector.toString();
                const locator = page.locator(elementSelector);
                
                await overlay.showViolationOverlay({ id: violation.id, help: violation.help }, severityColor);
                
                if (await locator.isVisible()) {
                    await overlay.highlightElement(elementSelector, severityColor);
                    
                    // Allow time for video capture or manual inspection during debug
                    // eslint-disable-next-line playwright/no-wait-for-timeout
                    await page.waitForTimeout(2000);

                    const screenshotName = `a11y-${violation.id}-${errorIdx++}.png`;
                    const buffer = await overlay.captureAndAttachScreenshot(screenshotName, testInfo);
                    
                    // Capture execution steps for context
                    const excluded = new Set(['Pre Condition', 'Post Condition', 'Description', 'A11y']);
                    const contextSteps = testInfo.annotations
                        .filter(a => !excluded.has(a.type))
                        .map(a => a.description || '');

                    const nodeHtml = node.html || '';
                    const friendlySnippet = elementSelector; // Use full CSS selector path from Axe core

                    targets.push({
                        element: elementSelector,
                        snippet: friendlySnippet,
                        html: nodeHtml,
                        screenshot: screenshotName,
                        steps: contextSteps,
                        stepsJson: JSON.stringify(contextSteps),
                        screenshotBase64: buffer.toString('base64')
                    });
                    
                    await overlay.unhighlightElement();
                }
            }
        }

        errors.push({
            id: violation.id,
            description: violation.description,
            severity: violation.impact || 'unknown',
            helpUrl: violation.helpUrl,
            help: violation.help,
            guideline: violation.tags[1] || 'N/A',
            wcagRule: violation.tags.find(t => t.startsWith('wcag')) || violation.tags[1] || 'N/A',
            total: targets.length || violation.nodes.length, // Fallback to node count if no screenshots
            target: targets
        });
    }

    // Prepare data for the reporter
    const reportData: ReportData = {
        pageKey: page.url(),
        accessibilityScore: 0, // No longer used, derivation from Lighthouse removed
        errors,
        video: 'a11y-scan-video.webm', // Reference name for reporter
        criticalColor: Severity.critical,
        seriousColor: Severity.serious,
        moderateColor: Severity.moderate,
        minorColor: Severity.minor,
        adoOrganization: process.env.ADO_ORGANIZATION || '',
        adoProject: process.env.ADO_PROJECT || ''
    };

    await overlay.addTestAttachment(testInfo, 'A11y', JSON.stringify(reportData));
    await overlay.hideViolationOverlay();
}

/** Alias for backward compatibility */
export const checkAccessibility = scanA11y;
