import { Reporter, TestCase, TestResult, TestStep, FullResult, FullConfig } from '@playwright/test/reporter';
import { ReportData, TestResults, TestSummary, TestStatusIcon } from './models';
import { A11yReportAssets } from './A11yReportAssets';
import { A11yHtmlRenderer } from './A11yHtmlRenderer';
import { A11yTimeUtils } from './A11yTimeUtils';
import * as path from 'path';

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

class SnapAllyLegacyReporter implements Reporter {
    private testNo = 0;
    private folderResults: string;
    private fileHelper = new A11yReportAssets();
    private htmlHelper = new A11yHtmlRenderer();
    private options: AccessibilityReporterOptions;
    private testDir = 'tests';
    
    // Summary state
    summary: TestSummary = {
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
        totalA11yErrorCount: 0
    };

    constructor(options: AccessibilityReporterOptions = {}) {
        this.options = options;
        this.folderResults = options.outputFolder || 'steps-report';
    }

    onBegin(config: FullConfig) {
        this.testDir = config.rootDir || 'tests';
    }

    async onTestEnd(test: TestCase, result: TestResult) {
        this.testNo++;
        const folderTest = path.join(this.folderResults, this.testNo.toString());
        
        // --- Step Reporting Logic ---
        const groupKey = path.relative(this.testDir, test.location.file);
        if (!this.summary.groupedResults[groupKey]) {
            this.summary.groupedResults[groupKey] = [];
        }

        const tags = test.tags.map(tag => tag.replace('@', '')) ?? [];
        const statusIcon = TestStatusIcon[result.status as keyof typeof TestStatusIcon];
        
        // Parse annotations for status report
        const descriptionAnnotation = test.annotations.find(annotation => annotation.type == 'Description');
        const description = descriptionAnnotation?.description ?? 'No Description';
        const browser = test.parent.project()?.name ?? 'No browser';
        
        // Steps filtering (exclude internal ones)
        const excludedSteps = new Set(['Pre Condition', 'Post Condition', 'Description', 'A11y']);
        const steps = test.annotations
            .filter(annotation => !excludedSteps.has(annotation.type))
            .map(annotation => annotation.description ?? 'No steps');
            
        const preConditions = test.annotations.filter(annotation => annotation.type == 'Pre Condition')
            .map(annotation => annotation.description ?? 'No pre conditions');
        const postConditions = test.annotations.filter(annotation => annotation.type == 'Post Condition')
            .map(annotation => annotation.description ?? 'No post conditions');

        const attachments: { path: string, name: string }[] = result.attachments
            .filter(attachment => attachment.name !== 'screenshot' && attachment.name !== 'video' && !attachment.name.toLowerCase().includes('allure'))
            .map(attachment => ({ path: attachment.path ?? '', name: attachment.name ?? '' })) ?? [];
        
        const reportAttachments = attachments.map(attachment => ({
            path: this.fileHelper.copyToFolder(folderTest, attachment.path),
            name: attachment.name
        }));

        const videoPath = await this.fileHelper.copyTestVideo(result, folderTest);
        const screenshotPaths = this.fileHelper.copyScreenshots(result, folderTest);
        const errors = result.errors.map(error => this.htmlHelper.ansiToHtml(error.message ?? 'No errors')) ?? [];

        const resultItem: TestResults = {
            num: this.testNo,
            folderName: this.testNo.toString(),
            title: test.title,
            fileName: groupKey,
            timeDuration: result.duration,
            duration: A11yTimeUtils.formatDuration(result.duration),
            description: description,
            status: result.status,
            browser: browser,
            tags: tags,
            preConditions: preConditions,
            steps: steps,
            postConditions: postConditions,
            statusIcon: statusIcon,
            videoPath: videoPath,
            screenshotPaths: screenshotPaths,
            attachments: reportAttachments,
            errors: errors
        };

        this.summary.groupedResults[groupKey].push(resultItem);
        const wasRetried = test.results && test.results.length > 1;
        const isFlaky = wasRetried && result.status === 'passed';
        if (isFlaky) this.summary.totalFlaky++;

        switch (result.status) {
            case 'passed': this.summary.totalPassed++; break;
            case 'failed': this.summary.totalFailed++; break;
            case 'skipped': this.summary.totalSkipped++; break;
        }
        this.summary.total++;

        // Generate Step Report (index.html)
        const indexFilePath = path.join(folderTest, 'index.html');
        await this.htmlHelper.render('stepReporter.html', { result: resultItem }, folderTest, indexFilePath);


        // --- Accessibility Reporting Logic ---
        // Only process if there is A11y annotation
        const reportDataAnnotation = test.annotations.find(annotation => annotation.type === 'A11y');
        
        if (reportDataAnnotation) {
            let fileName = `a11y${this.testNo}.html`;
            let reportData: ReportData = JSON.parse(reportDataAnnotation.description ?? '{}');

            // Sanitize pageKey for filename
            if (reportData.pageKey) {
                const sanitizedKey = reportData.pageKey
                    .replace(/https?:\/\//, '')
                    .replace(/[^a-z0-9]+/gi, '-')
                    .replace(/^-+|-+$/g, '')
                    .toLowerCase();
                fileName = sanitizedKey ? `${sanitizedKey}.html` : fileName;
            }

            const filePath = path.join(folderTest, fileName);
            
            // Override configs with options or defaults
            reportData.criticalColor = this.options.colors?.critical || '#bd1f35';
            reportData.seriousColor = this.options.colors?.serious || '#d67f05';
            reportData.moderateColor = this.options.colors?.moderate || '#f0c000';
            reportData.minorColor = this.options.colors?.minor || '#2da4cf';

            if (this.options.ado) {
                if (this.options.ado.organization) reportData.adoOrganization = this.options.ado.organization;
                if (this.options.ado.project) reportData.adoProject = this.options.ado.project;
            }

            // Enrich with Playwright steps if available
            const playwrightSteps = this.getTestSteps(result);
            if (playwrightSteps.length > 0 && reportData.errors) {
                reportData.errors.forEach(error => {
                    if (error.target) {
                        error.target.forEach(target => {
                            // Merge annotation steps with Playwright steps
                            const existingSteps = new Set(target.steps || []);
                            playwrightSteps.forEach(step => {
                                if (!existingSteps.has(step)) {
                                    if (!target.steps) target.steps = [];
                                    target.steps.push(step);
                                }
                            });
                            // Update JSON for bug creation
                            target.stepsJson = JSON.stringify(target.steps);
                        });
                    }
                    // Aggregate WCAG errors for summary chart
                    const ruleId = error.id;
                    const totalViolations = error.total || 0;
                    if (!this.summary.wcagErrors[ruleId]) {
                        this.summary.wcagErrors[ruleId] = { count: 0, severity: error.severity, helpUrl: error.helpUrl };
                    }
                    this.summary.wcagErrors[ruleId].count += totalViolations;
                });
            }

            this.fileHelper.copyPngAttachments(result, folderTest);
            
            await this.htmlHelper.render('page-report.html', { data: reportData, folderTest }, folderTest, filePath);
        }
    }

    async onEnd(result: FullResult) {
        const folderTest = this.folderResults;
        const summaryName = 'index.html';
        const summaryPath = path.join(folderTest, summaryName);
        this.summary.duration = A11yTimeUtils.formatDuration(result.duration);
        this.summary.status = result.status;
        const statusIcon = TestStatusIcon[result.status as keyof typeof TestStatusIcon];
        this.summary.statusIcon = statusIcon;

        const colors = {
            critical: this.options.colors?.critical || '#bd1f35',
            serious: this.options.colors?.serious || '#d67f05',
            moderate: this.options.colors?.moderate || '#f0c000',
            minor: this.options.colors?.minor || '#2da4cf'
        };

        await this.htmlHelper.render('global-summary.html', { results: this.summary, colors }, folderTest, summaryPath);
    }

    private getTestSteps(result: TestResult): string[] {
        const steps: string[] = [];
        const processSteps = (testSteps: TestStep[]) => {
            for (const step of testSteps) {
                if (step.category === 'test.step') {
                    steps.push(step.title);
                }
                if (step.steps) {
                    processSteps(step.steps);
                }
            }
        };
        if (result.steps) {
            processSteps(result.steps);
        }
        return steps;
    }
}

export default SnapAllyLegacyReporter;
