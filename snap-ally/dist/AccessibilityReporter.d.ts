import { Reporter, TestCase, TestResult, FullResult, FullConfig } from '@playwright/test/reporter';
import { TestSummary } from './models';
export interface AccessibilityReporterOptions {
    outputFolder?: string;
    colors?: {
        critical?: string;
        serious?: string;
        moderate?: string;
        minor?: string;
    };
    ado?: {
        organization?: string;
        project?: string;
    };
}
declare class AccessibilityReporter implements Reporter {
    private testNo;
    private folderResults;
    private fileHelper;
    private htmlHelper;
    private options;
    private testDir;
    summary: TestSummary;
    constructor(options?: AccessibilityReporterOptions);
    onBegin(config: FullConfig): void;
    onTestEnd(test: TestCase, result: TestResult): Promise<void>;
    onEnd(result: FullResult): Promise<void>;
    private getTestSteps;
}
export default AccessibilityReporter;
