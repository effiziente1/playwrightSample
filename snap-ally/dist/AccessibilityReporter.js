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
class AccessibilityReporter {
    constructor(options = {}) {
        this.testNo = 0;
        this.fileHelper = new A11yReportAssets_1.A11yReportAssets();
        this.htmlHelper = new A11yHtmlRenderer_1.A11yHtmlRenderer();
        this.testDir = 'tests';
        // Summary state
        this.summary = {
            duration: '',
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
        this.options = options;
        this.folderResults = options.outputFolder || 'steps-report';
    }
    onBegin(config) {
        this.testDir = config.rootDir || 'tests';
    }
    async onTestEnd(test, result) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        this.testNo++;
        const folderTest = path.join(this.folderResults, this.testNo.toString());
        // --- Step Reporting Logic ---
        const groupKey = path.relative(this.testDir, test.location.file);
        if (!this.summary.groupedResults[groupKey]) {
            this.summary.groupedResults[groupKey] = [];
        }
        const tags = (_a = test.tags.map(tag => tag.replace('@', ''))) !== null && _a !== void 0 ? _a : [];
        const statusIcon = models_1.TestStatusIcon[result.status];
        // Parse annotations for status report
        const descriptionAnnotation = test.annotations.find(annotation => annotation.type == 'Description');
        const description = (_b = descriptionAnnotation === null || descriptionAnnotation === void 0 ? void 0 : descriptionAnnotation.description) !== null && _b !== void 0 ? _b : 'No Description';
        const browser = (_d = (_c = test.parent.project()) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : 'No browser';
        // Steps filtering (exclude internal ones)
        const excludedSteps = new Set(['Pre Condition', 'Post Condition', 'Description', 'A11y']);
        const steps = test.annotations
            .filter(annotation => !excludedSteps.has(annotation.type))
            .map(annotation => { var _a; return (_a = annotation.description) !== null && _a !== void 0 ? _a : 'No steps'; });
        const preConditions = test.annotations.filter(annotation => annotation.type == 'Pre Condition')
            .map(annotation => { var _a; return (_a = annotation.description) !== null && _a !== void 0 ? _a : 'No pre conditions'; });
        const postConditions = test.annotations.filter(annotation => annotation.type == 'Post Condition')
            .map(annotation => { var _a; return (_a = annotation.description) !== null && _a !== void 0 ? _a : 'No post conditions'; });
        const attachments = (_e = result.attachments
            .filter(attachment => attachment.name !== 'screenshot' && attachment.name !== 'video' && !attachment.name.toLowerCase().includes('allure'))
            .map(attachment => { var _a, _b; return ({ path: (_a = attachment.path) !== null && _a !== void 0 ? _a : '', name: (_b = attachment.name) !== null && _b !== void 0 ? _b : '' }); })) !== null && _e !== void 0 ? _e : [];
        const reportAttachments = attachments.map(attachment => ({
            path: this.fileHelper.copyToFolder(folderTest, attachment.path),
            name: attachment.name
        }));
        const videoPath = this.fileHelper.copyTestVideo(result, folderTest);
        const screenshotPaths = this.fileHelper.copyScreenshots(result, folderTest);
        const errors = (_f = result.errors.map(error => { var _a; return this.htmlHelper.ansiToHtml((_a = error.message) !== null && _a !== void 0 ? _a : 'No errors'); })) !== null && _f !== void 0 ? _f : [];
        const resultItem = {
            num: this.testNo,
            folderName: this.testNo.toString(),
            title: test.title,
            fileName: groupKey,
            timeDuration: result.duration,
            duration: A11yTimeUtils_1.A11yTimeUtils.formatDuration(result.duration),
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
        if (isFlaky)
            this.summary.totalFlaky++;
        switch (result.status) {
            case 'passed':
                this.summary.totalPassed++;
                break;
            case 'failed':
                this.summary.totalFailed++;
                break;
            case 'skipped':
                this.summary.totalSkipped++;
                break;
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
            let reportData = JSON.parse((_g = reportDataAnnotation.description) !== null && _g !== void 0 ? _g : '{}');
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
            reportData.criticalColor = ((_h = this.options.colors) === null || _h === void 0 ? void 0 : _h.critical) || '#bd1f35';
            reportData.seriousColor = ((_j = this.options.colors) === null || _j === void 0 ? void 0 : _j.serious) || '#d67f05';
            reportData.moderateColor = ((_k = this.options.colors) === null || _k === void 0 ? void 0 : _k.moderate) || '#f0c000';
            reportData.minorColor = ((_l = this.options.colors) === null || _l === void 0 ? void 0 : _l.minor) || '#2da4cf';
            if (this.options.ado) {
                if (this.options.ado.organization)
                    reportData.adoOrganization = this.options.ado.organization;
                if (this.options.ado.project)
                    reportData.adoProject = this.options.ado.project;
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
                                    if (!target.steps)
                                        target.steps = [];
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
    async onEnd(result) {
        var _a, _b, _c, _d;
        const folderTest = this.folderResults;
        const summaryName = 'index.html';
        const summaryPath = path.join(folderTest, summaryName);
        this.summary.duration = A11yTimeUtils_1.A11yTimeUtils.formatDuration(result.duration);
        this.summary.status = result.status;
        const statusIcon = models_1.TestStatusIcon[result.status];
        this.summary.statusIcon = statusIcon;
        const colors = {
            critical: ((_a = this.options.colors) === null || _a === void 0 ? void 0 : _a.critical) || '#bd1f35',
            serious: ((_b = this.options.colors) === null || _b === void 0 ? void 0 : _b.serious) || '#d67f05',
            moderate: ((_c = this.options.colors) === null || _c === void 0 ? void 0 : _c.moderate) || '#f0c000',
            minor: ((_d = this.options.colors) === null || _d === void 0 ? void 0 : _d.minor) || '#2da4cf'
        };
        await this.htmlHelper.render('global-summary.html', { results: this.summary, colors }, folderTest, summaryPath);
    }
    getTestSteps(result) {
        const steps = [];
        const processSteps = (testSteps) => {
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
exports.default = AccessibilityReporter;
