import { Reporter, TestCase, TestResult, FullResult, FullConfig } from '@playwright/test/reporter';
export interface AccessibilityReporterOptions {
    /**
     * Folder where the reports will be generated.
     * @default "steps-report"
     */
    outputFolder?: string;
    /**
     * Custom colors for violation severities in the report.
     */
    colors?: {
        critical?: string;
        serious?: string;
        moderate?: string;
        minor?: string;
    };
    /**
     * Azure DevOps integration options.
     */
    ado?: {
        organization?: string;
        project?: string;
    };
}
/**
 * Playwright reporter for accessibility audits and test steps.
 * Generates an execution summary and detailed reports per test.
 */
declare class SnapAllyReporter implements Reporter {
    private testIndex;
    private outputFolder;
    private assetsManager;
    private renderer;
    private options;
    private projectRoot;
    private executionSummary;
    private tasks;
    constructor(options?: AccessibilityReporterOptions);
    onBegin(config: FullConfig): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    private processTestResult;
    onEnd(result: FullResult): Promise<void>;
}
export default SnapAllyReporter;
