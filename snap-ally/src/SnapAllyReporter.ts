import { Reporter, TestCase, TestResult, FullResult, FullConfig } from '@playwright/test/reporter';
import { ReportData, TestResults, TestSummary, TestStatusIcon, A11yError } from './models';
import { A11yReportAssets } from './A11yReportAssets';
import { A11yHtmlRenderer } from './A11yHtmlRenderer';
import { A11yTimeUtils } from './A11yTimeUtils';
import * as path from 'path';
import * as fs from 'fs';

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
class SnapAllyReporter implements Reporter {
    private testIndex = 0;
    private outputFolder: string;
    private assetsManager = new A11yReportAssets();
    private renderer = new A11yHtmlRenderer();
    private options: AccessibilityReporterOptions;
    private projectRoot = 'tests';
    
    // Global summary tracking
    private executionSummary: TestSummary = {
        duration: '',
        status: '',
        statusIcon: '',
        total: 0,
        totalFailed: 0,
        totalFlaky: 0,
        totalPassed: 0,
        totalSkipped: 0,
        groupedResults: {},
        wcagErrors: {},
        totalA11yErrorCount: 0,
        browserSummaries: {}
    };

    // Track async tasks to ensure they finish before onEnd
    private tasks: Promise<void>[] = [];

    constructor(options: AccessibilityReporterOptions = {}) {
        this.options = options;
        this.outputFolder = path.resolve(process.cwd(), options.outputFolder || 'steps-report');
    }

    onBegin(config: FullConfig) {
        this.projectRoot = config.rootDir || 'tests';
    }

    onTestEnd(test: TestCase, result: TestResult) {
        this.tasks.push(this.processTestResult(test, result));
    }

    private async processTestResult(test: TestCase, result: TestResult) {
        this.testIndex++;
        const sanitizedTitle = test.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
        const testFolderName = `${this.testIndex}-${sanitizedTitle}`;
        const testResultsFolder = path.join(this.outputFolder, testFolderName);
        
        // --- 1. Functional Step Reporting ---
        const fileGroup = path.relative(this.projectRoot, test.location.file);
        if (!this.executionSummary.groupedResults[fileGroup]) {
            this.executionSummary.groupedResults[fileGroup] = [];
        }

        const tags = test.tags.map(t => t.replace('@', ''));
        const statusIcon = TestStatusIcon[result.status as keyof typeof TestStatusIcon] || 'help';
        const browser = test.parent.project()?.name || 'unknown';
        
        const descAnnotation = test.annotations.find(a => a.type === 'Description');
        const description = descAnnotation?.description || 'No Description';
        
        // Prepare steps from annotations
        const skipTypes = new Set(['Pre Condition', 'Post Condition', 'Description', 'A11y']);
        const steps = test.annotations
            .filter(a => !skipTypes.has(a.type))
            .map(a => a.description || 'Step');
            
        const preConditions = test.annotations
            .filter(a => a.type === 'Pre Condition')
            .map(a => a.description || '');
        const postConditions = test.annotations
            .filter(a => a.type === 'Post Condition')
            .map(a => a.description || '');

        const video = await this.assetsManager.copyTestVideo(result, testResultsFolder);
        const screenshots = this.assetsManager.copyScreenshots(result, testResultsFolder);
        const pngAttachments = this.assetsManager.copyPngAttachments(result, testResultsFolder);
        const otherAttachments = this.assetsManager.copyAllOtherAttachments(result, testResultsFolder);
        const allAttachments = [...pngAttachments, ...otherAttachments];
        
        console.log(`[SnapAlly Debug] Test "${test.title}" ended. Status: ${result.status}. Video: ${video ? 'Created' : 'Missing'}`);
        console.log(`[SnapAlly Debug] Raw Attachments: ${result.attachments.map(a => `${a.name} (${a.path ? 'file' : 'body'})`).join(', ')}`);

        const errorLogs = result.errors.map(err => {
            const fullMsg = err.stack ? `${err.message}\n${err.stack}` : (err.message || 'Error occurred');
            return this.renderer.ansiToHtml(fullMsg);
        }) || [];

        // --- 2. Accessibility Reporting (Iterate over all A11y sources: attachments and annotations) ---
        const a11yAttachments = result.attachments.filter(a => a.name === 'A11y');
        const a11yAnnotations = test.annotations.filter(a => a.type === 'A11y');
        
        const a11yDataSources = [
            ...a11yAttachments.map(a => ({ type: 'attachment', data: a })),
            ...a11yAnnotations.map(a => ({ type: 'annotation', data: a }))
        ];

        if (a11yDataSources.length === 0) {
            console.error(`[SnapAlly Debug] No A11y data sources found for test: ${test.title}`);
        }

        let a11yReportPath: string | undefined = undefined;
        let a11yErrorCount = 0;
        let aggregatedA11yErrors: A11yError[] = [];

        // Loop through all accessibility scans in this test
        for (const [index, source] of a11yDataSources.entries()) {
            let reportData: ReportData;
            
            try {
                if (source.type === 'attachment') {
                    const attach = source.data as { name: string, body?: Buffer, path?: string };
                    if (attach.body) {
                        reportData = JSON.parse(attach.body.toString());
                    } else if (attach.path && fs.existsSync(attach.path)) {
                        reportData = JSON.parse(fs.readFileSync(attach.path, 'utf-8'));
                    } else {
                        continue;
                    }
                } else {
                    const annot = source.data as { type: string, description?: string };
                    reportData = JSON.parse(annot.description || '{}');
                }
            } catch (e) {
                console.error(`[SnapAlly] Failed to parse A11y ${source.type}: ${e}`);
                errorLogs.push(this.renderer.ansiToHtml(`[SnapAlly] Internal error parsing accessibility data from ${source.type}: ${e}`));
                continue;
            }

            // Determine Report Name (append index if multiple)
            let a11yReportName = `accessibility-${sanitizedTitle}.html`;
            if (a11yDataSources.length > 1) {
                a11yReportName = `accessibility-${sanitizedTitle}-${index + 1}.html`;
            }

            // Sanitize pageKey for filename override if present
            if (reportData.pageKey) {
                const sanitizedKey = reportData.pageKey
                    .replace(/https?:\/\//, '')
                    .replace(/[^a-z0-9]+/gi, '-')
                    .replace(/^-+|-+$/g, '')
                    .toLowerCase();
                    
                if (sanitizedKey) {
                    a11yReportName = a11yDataSources.length > 1 
                        ? `${sanitizedKey}-${index + 1}.html` 
                        : `${sanitizedKey}.html`;
                }
            }
            
            // Set the main report path to the LAST one (or maybe first? using last for now)
            a11yReportPath = a11yReportName;
            
            // Re-apply configuration
            reportData.criticalColor = this.options.colors?.critical || '#c92a2a';
            reportData.seriousColor = this.options.colors?.serious || '#e67700';
            reportData.moderateColor = this.options.colors?.moderate || '#ca8a04';
            reportData.minorColor = this.options.colors?.minor || '#0891b2';

            if (this.options.ado) {
                reportData.adoOrganization = this.options.ado.organization || reportData.adoOrganization;
                reportData.adoProject = this.options.ado.project || reportData.adoProject;
            }

            // Sync video name
            if (video) reportData.video = video;

            const auditFile = path.join(testResultsFolder, a11yReportName);
            await this.renderer.render('accessibility-report.html', { data: reportData, folderTest: testResultsFolder }, testResultsFolder, auditFile);

            // --- 3. Update Browser-Specific Summary (Partial Aggregation) ---
            if (!this.executionSummary.browserSummaries![browser]) {
                this.executionSummary.browserSummaries![browser] = {
                    duration: '0s',
                    status: '',
                    statusIcon: '',
                    total: 0,
                    totalFailed: 0,
                    totalFlaky: 0,
                    totalPassed: 0,
                    totalSkipped: 0,
                    groupedResults: {},
                    wcagErrors: {},
                    totalA11yErrorCount: 0
                };
            }
            const bSummary = this.executionSummary.browserSummaries![browser];
            
            if (reportData.errors && reportData.errors.length > 0) {
                // Aggregate counts
                a11yErrorCount += reportData.errors.reduce((sum: number, err: A11yError) => sum + (err.total || 0), 0);
                aggregatedA11yErrors.push(...reportData.errors);

                reportData.errors.forEach((err: A11yError) => {
                    const rule = err.id;
                    
                    // Local Browser aggregation 
                    if (!bSummary.wcagErrors[rule]) {
                        bSummary.wcagErrors[rule] = { 
                            count: 0, 
                            severity: err.severity, 
                            helpUrl: err.helpUrl,
                            description: err.description 
                        };
                    }
                    bSummary.wcagErrors[rule].count += (err.total || 0);

                    // Global aggregation (always add to ensure summary is not empty)
                    if (!this.executionSummary.wcagErrors[rule]) {
                        this.executionSummary.wcagErrors[rule] = { 
                            count: 0, 
                            severity: err.severity, 
                            helpUrl: err.helpUrl,
                            description: err.description 
                        };
                    }
                    this.executionSummary.wcagErrors[rule].count += (err.total || 0);
                });
                this.executionSummary.totalA11yErrorCount += a11yErrorCount;
            }
        }


        // --- 4. Final Aggregation and Test Stats ---
        // Update browser summary counts (always, even if no a11y scan occurred)
        if (!this.executionSummary.browserSummaries![browser]) {
            this.executionSummary.browserSummaries![browser] = {
                duration: '0s', status: '', statusIcon: '', total: 0, 
                totalFailed: 0, totalFlaky: 0, totalPassed: 0, totalSkipped: 0,
                groupedResults: {}, wcagErrors: {}, totalA11yErrorCount: 0
            };
        }
        
        const bSummary = this.executionSummary.browserSummaries![browser];
        bSummary.total++;
        switch (result.status) {
            case 'passed': bSummary.totalPassed++; break;
            case 'failed': bSummary.totalFailed++; break;
            case 'skipped': bSummary.totalSkipped++; break;
        }


        const executionReportName = `execution-${sanitizedTitle}.html`;
        const testStats: TestResults = {
            num: this.testIndex,
            folderName: testFolderName,
            executionReportPath: `${testFolderName}/${executionReportName}`,
            title: test.title,
            fileName: fileGroup,
            timeDuration: result.duration,
            duration: A11yTimeUtils.formatDuration(result.duration),
            description,
            status: result.status,
            browser,
            tags,
            preConditions,
            steps,
            postConditions,
            statusIcon,
            videoPath: video,
            screenshotPaths: screenshots,
            attachments: allAttachments,
            errors: errorLogs,
            a11yReportPath,
            a11yErrorCount,
            a11yErrors: aggregatedA11yErrors
        };

        this.executionSummary.groupedResults[fileGroup].push(testStats);
        
        // Update summary counts
        const isFlaky = test.results.length > 1 && result.status === 'passed';
        if (isFlaky) this.executionSummary.totalFlaky++;

        switch (result.status) {
            case 'passed': this.executionSummary.totalPassed++; break;
            case 'failed': this.executionSummary.totalFailed++; break;
            case 'skipped': this.executionSummary.totalSkipped++; break;
        }
        this.executionSummary.total++;

        // Create color config for template
        const colors = {
            critical: this.options.colors?.critical || '#c92a2a',
            serious: this.options.colors?.serious || '#e67700',
            moderate: this.options.colors?.moderate || '#ca8a04',
            minor: this.options.colors?.minor || '#0891b2'
        };

        // Render Step Report
        const indexFile = path.join(testResultsFolder, `execution-${sanitizedTitle}.html`);
        await this.renderer.render('test-execution-report.html', { result: testStats, colors }, testResultsFolder, indexFile);
    }

    async onEnd(result: FullResult) {
        // Wait for all test result processing to finish
        await Promise.all(this.tasks);
        
        const summaryFile = path.join(this.outputFolder, 'summary.html');
        this.executionSummary.duration = A11yTimeUtils.formatDuration(result.duration);
        this.executionSummary.status = result.status;
        this.executionSummary.statusIcon = TestStatusIcon[result.status as keyof typeof TestStatusIcon] || 'help';

        const colors = {
            critical: this.options.colors?.critical || '#c92a2a',
            serious: this.options.colors?.serious || '#e67700',
            moderate: this.options.colors?.moderate || '#ca8a04',
            minor: this.options.colors?.minor || '#0891b2'
        };

        await this.renderer.render('execution-summary.html', { results: this.executionSummary, colors }, this.outputFolder, summaryFile);
        
        console.log(`\n[SnapAlly] Reports generated in: ${path.resolve(this.outputFolder)}`);
    }
}

export default SnapAllyReporter;
