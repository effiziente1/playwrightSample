import { FullConfig, FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import { AnnotationType } from '../annotations/AnnotationType';
import { TestStatusIcon } from './models/TestStatusIcon';
import { TestResults } from './models/TestResults';
import { FileHelper } from '../FileHelper';
import { HtmlHelper } from '../HtmlHelper';
import { TimeHelper } from '../TimeHelper';
import { TestSummary } from '../reporter/models/TestSummary';
import * as path from 'path';

class StepReporter implements Reporter {
    private testNo = 0;
    private fileHelper: FileHelper = new FileHelper();
    private htmlHelper: HtmlHelper = new HtmlHelper();
    private timeHelper = new TimeHelper();

    results: TestResults[] = [];
    summary: TestSummary = {
        duration: '',
        status: '',
        statusIcon: '',
        total: 0,
        totalFailed: 0,
        totalFlaky: 0,
        totalPassed: 0,
        totalSkipped: 0,
        groupedResults: {}
    };

    private testDir = 'tests';

    onBegin(config: FullConfig) {
        // Prefer the testDir from config if provided; fallback to the default if not.
        this.testDir = config?.rootDir || 'tests';
    }

    async onTestEnd(test: TestCase, result: TestResult) {
        this.testNo++;
        const folderTest = path.join(this.fileHelper.folderResults, this.testNo.toString());
        const groupKey = path.relative(this.testDir, test.location.file);

        // Ensure an array exists for this group
        if (!this.summary.groupedResults[groupKey]) {
            this.summary.groupedResults[groupKey] = [];
        }

        const tags = test.tags.map(tag => tag.replace('@', '')) ?? [];
        const statusIcon = TestStatusIcon[result.status as keyof typeof TestStatusIcon];
        const steps = test.annotations.filter(annotation =>
            annotation.type != AnnotationType.Precondition
            && annotation.type != AnnotationType.PostCondition
            && annotation.type != AnnotationType.Description
            && annotation.type != 'A11y')
            .map(annotation => annotation.description ?? 'No steps');
        const preConditions = test.annotations.filter(annotation => annotation.type == AnnotationType.Precondition)
            .map(annotation => annotation.description ?? 'No pre conditions');
        const postConditions = test.annotations.filter(annotation => annotation.type == AnnotationType.PostCondition)
            .map(annotation => annotation.description ?? 'No post conditions');
        const descriptionAnnotation = test.annotations.find(annotation => annotation.type == AnnotationType.Description);
        const description = descriptionAnnotation?.description ?? 'No Description';
        const browser = test.parent.project()?.name ?? 'No browser';

        const attachments: { path: string, name: string }[] = result.attachments
            .filter(attachment => attachment.name !== 'screenshot' && attachment.name !== 'video' && !attachment.name.toLowerCase().includes('allure'))
            .map(attachment => ({ path: attachment.path ?? '', name: attachment.name ?? '' })) ?? [];
        const copiedAttachments = attachments.map(attachment => ({
            path: this.fileHelper.copyFileToResults(folderTest, attachment.path),
            name: attachment.name
        }));

        const videoPath = this.fileHelper.copyVideo(result, folderTest);
        const screenshotPaths = this.fileHelper.copyScreenshots(result, folderTest);

        // Capture errors
        const errors = result.errors.map(error => this.htmlHelper.ansiToHtml(error.message ?? 'No errors')) ?? [];

        const formattedDuration = this.timeHelper.formatDuration(result.duration);

        const resultItem: TestResults = {
            num: this.testNo,
            title: test.title,
            fileName: groupKey,
            timeDuration: result.duration,
            duration: formattedDuration,
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
            attachments: copiedAttachments,
            errors: errors
        };

        //this.results.push(resultItem);
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
        const fileName = 'index.html';
        const testFilePath = path.join(folderTest, fileName);
        await this.htmlHelper.replaceTags('stepReporter.html', { result: resultItem }, folderTest, testFilePath);

    }

    async onEnd(result: FullResult) {
        const folderTest = this.fileHelper.folderResults;
        const summaryName = 'summary.html';
        const summaryPath = path.join(folderTest, summaryName);
        this.summary.duration = this.timeHelper.formatDuration(result.duration);
        this.summary.status = result.status;
        const statusIcon = TestStatusIcon[result.status as keyof typeof TestStatusIcon];
        this.summary.statusIcon = statusIcon;
        await this.htmlHelper.replaceTags('summary.html', { results: this.summary }, folderTest, summaryPath);
    }
}

export default StepReporter;