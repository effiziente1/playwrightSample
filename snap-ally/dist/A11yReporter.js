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
const models_1 = require("./models");
const A11yReportAssets_1 = require("./A11yReportAssets");
const A11yHtmlRenderer_1 = require("./A11yHtmlRenderer");
const A11yTimeUtils_1 = require("./A11yTimeUtils");
const path = __importStar(require("path"));
/**
 * Playwright reporter for accessibility audits and test steps.
 * Generates an execution summary and detailed reports per test.
 */
class A11yReporter {
    constructor(options = {}) {
        this.testIndex = 0;
        this.assetsManager = new A11yReportAssets_1.A11yReportAssets();
        this.renderer = new A11yHtmlRenderer_1.A11yHtmlRenderer();
        this.projectRoot = 'tests';
        // Global summary tracking
        this.executionSummary = {
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
            browserSummaries: {}
        };
        // Tracking for global deduplication: ruleId -> Set<pageKey>
        this.uniqueGlobalIssues = new Map();
        this.options = options;
        this.outputFolder = options.outputFolder || 'steps-report';
    }
    onBegin(config) {
        this.projectRoot = config.rootDir || 'tests';
    }
    async onTestEnd(test, result) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
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
        const statusIcon = models_1.TestStatusIcon[result.status] || 'help';
        const browser = ((_a = test.parent.project()) === null || _a === void 0 ? void 0 : _a.name) || 'unknown';
        const descAnnotation = test.annotations.find(a => a.type === 'Description');
        const description = (descAnnotation === null || descAnnotation === void 0 ? void 0 : descAnnotation.description) || 'No Description';
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
        // Copy attachments
        const video = this.assetsManager.copyTestVideo(result, testResultsFolder);
        const screenshots = this.assetsManager.copyScreenshots(result, testResultsFolder);
        this.assetsManager.copyPngAttachments(result, testResultsFolder);
        const errorLogs = result.errors.map(err => this.renderer.ansiToHtml(err.message || 'Error occurred'));
        // --- 2. Accessibility Reporting (Pre-scan for path) ---
        let a11yReportName = `accessibility-${sanitizedTitle}.html`;
        const a11yAnnotation = test.annotations.find(a => a.type === 'A11y');
        let a11yReportPath = undefined;
        let a11yErrorCount = 0;
        if (a11yAnnotation) {
            let reportData = JSON.parse(a11yAnnotation.description || '{}');
            // Sanitize pageKey for filename
            if (reportData.pageKey) {
                const sanitizedKey = reportData.pageKey
                    .replace(/https?:\/\//, '')
                    .replace(/[^a-z0-9]+/gi, '-')
                    .replace(/^-+|-+$/g, '')
                    .toLowerCase();
                a11yReportName = sanitizedKey ? `${sanitizedKey}.html` : a11yReportName;
            }
            a11yReportPath = a11yReportName;
            // Re-apply configuration
            reportData.criticalColor = ((_b = this.options.colors) === null || _b === void 0 ? void 0 : _b.critical) || '#c92a2a';
            reportData.seriousColor = ((_c = this.options.colors) === null || _c === void 0 ? void 0 : _c.serious) || '#e67700';
            reportData.moderateColor = ((_d = this.options.colors) === null || _d === void 0 ? void 0 : _d.moderate) || '#ca8a04';
            reportData.minorColor = ((_e = this.options.colors) === null || _e === void 0 ? void 0 : _e.minor) || '#0891b2';
            if (this.options.ado) {
                reportData.adoOrganization = this.options.ado.organization || reportData.adoOrganization;
                reportData.adoProject = this.options.ado.project || reportData.adoProject;
            }
            // Sync video name
            if (video)
                reportData.video = video;
            const auditFile = path.join(testResultsFolder, a11yReportName);
            await this.renderer.render('a11y-report.html', { data: reportData, folderTest: testResultsFolder }, testResultsFolder, auditFile);
            // --- 3. Update Browser-Specific Summary ---
            if (!this.executionSummary.browserSummaries[browser]) {
                this.executionSummary.browserSummaries[browser] = {
                    duration: '0s',
                    status: '',
                    statusIcon: '',
                    total: 0,
                    totalFailed: 0,
                    totalFlaky: 0,
                    totalPassed: 0,
                    totalSkipped: 0,
                    groupedResults: {},
                    wcagErrors: {}
                };
            }
            const bSummary = this.executionSummary.browserSummaries[browser];
            if (reportData.errors) {
                // Calculate total errors for this specific test run
                a11yErrorCount = reportData.errors.reduce((sum, err) => sum + err.total, 0);
                reportData.errors.forEach(err => {
                    const rule = err.id;
                    // Local Browser aggregation (Not deduplicated across browsers, just within this browser scope)
                    // Wait, if the same test runs multiple times in the same browser (flaky), we might still want deduplication.
                    // But usually, one browser = one run per test in a standard report.
                    if (!bSummary.wcagErrors[rule]) {
                        bSummary.wcagErrors[rule] = {
                            count: 0,
                            severity: err.severity,
                            helpUrl: err.helpUrl,
                            description: err.description
                        };
                    }
                    bSummary.wcagErrors[rule].count += err.total;
                    // Global Deduplicated aggregation
                    if (!this.uniqueGlobalIssues.has(rule)) {
                        this.uniqueGlobalIssues.set(rule, new Set());
                    }
                    const seenPages = this.uniqueGlobalIssues.get(rule);
                    // Only count once per page globally
                    if (!seenPages.has(reportData.pageKey)) {
                        seenPages.add(reportData.pageKey);
                        if (!this.executionSummary.wcagErrors[rule]) {
                            this.executionSummary.wcagErrors[rule] = {
                                count: 0,
                                severity: err.severity,
                                helpUrl: err.helpUrl,
                                description: err.description
                            };
                        }
                        this.executionSummary.wcagErrors[rule].count += err.total;
                    }
                });
            }
            bSummary.total++;
            switch (result.status) {
                case 'passed':
                    bSummary.totalPassed++;
                    break;
                case 'failed':
                    bSummary.totalFailed++;
                    break;
                case 'skipped':
                    bSummary.totalSkipped++;
                    break;
            }
        }
        const executionReportName = `execution-${sanitizedTitle}.html`;
        const testStats = {
            num: this.testIndex,
            folderName: testFolderName,
            executionReportPath: `${testFolderName}/${executionReportName}`,
            title: test.title,
            fileName: fileGroup,
            timeDuration: result.duration,
            duration: A11yTimeUtils_1.A11yTimeUtils.formatDuration(result.duration),
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
            attachments: [], // Simplified for now
            errors: errorLogs,
            a11yReportPath,
            a11yErrorCount,
            a11yErrors: a11yAnnotation && a11yErrorCount > 0 ? JSON.parse(a11yAnnotation.description || '{}').errors : []
        };
        this.executionSummary.groupedResults[fileGroup].push(testStats);
        // Update summary counts
        const isFlaky = test.results.length > 1 && result.status === 'passed';
        if (isFlaky)
            this.executionSummary.totalFlaky++;
        switch (result.status) {
            case 'passed':
                this.executionSummary.totalPassed++;
                break;
            case 'failed':
                this.executionSummary.totalFailed++;
                break;
            case 'skipped':
                this.executionSummary.totalSkipped++;
                break;
        }
        this.executionSummary.total++;
        // Create color config for template
        const colors = {
            critical: ((_f = this.options.colors) === null || _f === void 0 ? void 0 : _f.critical) || '#c92a2a',
            serious: ((_g = this.options.colors) === null || _g === void 0 ? void 0 : _g.serious) || '#e67700',
            moderate: ((_h = this.options.colors) === null || _h === void 0 ? void 0 : _h.moderate) || '#ca8a04',
            minor: ((_j = this.options.colors) === null || _j === void 0 ? void 0 : _j.minor) || '#0891b2'
        };
        // Render Step Report
        const indexFile = path.join(testResultsFolder, `execution-${sanitizedTitle}.html`);
        await this.renderer.render('test-steps.html', { result: testStats, colors }, testResultsFolder, indexFile);
    }
    async onEnd(result) {
        var _a, _b, _c, _d;
        const summaryFile = path.join(this.outputFolder, 'summary.html');
        this.executionSummary.duration = A11yTimeUtils_1.A11yTimeUtils.formatDuration(result.duration);
        this.executionSummary.status = result.status;
        this.executionSummary.statusIcon = models_1.TestStatusIcon[result.status] || 'help';
        const colors = {
            critical: ((_a = this.options.colors) === null || _a === void 0 ? void 0 : _a.critical) || '#c92a2a',
            serious: ((_b = this.options.colors) === null || _b === void 0 ? void 0 : _b.serious) || '#e67700',
            moderate: ((_c = this.options.colors) === null || _c === void 0 ? void 0 : _c.moderate) || '#ca8a04',
            minor: ((_d = this.options.colors) === null || _d === void 0 ? void 0 : _d.minor) || '#0891b2'
        };
        await this.renderer.render('summary.html', { results: this.executionSummary, colors }, this.outputFolder, summaryFile);
        console.log(`\n[A11yReporter] Reports generated in: ${path.resolve(this.outputFolder)}`);
    }
}
exports.default = A11yReporter;
