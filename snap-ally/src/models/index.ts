
export interface ReportData {
    pageKey: string;
    accessibilityScore: number;
    video: string;
    errors: A11yError[];
    criticalColor: string;
    seriousColor: string;
    moderateColor: string;
    minorColor: string;
    adoOrganization?: string;
    adoProject?: string;
    adoPat?: string;
}

export interface A11yError {
    id: string;
    description: string;
    wcagRule: string;
    severity: string;
    help: string;
    helpUrl: string;
    guideline: string;
    total: number;
    target: Target[];
}

export interface Target {
    element: string;
    snippet: string;
    html: string;
    screenshot: string;
    steps: string[];
    stepsJson: string;
    screenshotBase64: string;
}

export interface ImagePath {
    srcPath: string;
    fileName: string;
}

export enum Severity {
    minor = 'minor',
    moderate = 'moderate',
    serious = 'serious',
    critical = 'critical'
}

export interface TestResults {
    num: number;
    folderName: string;
    title: string;
    fileName: string;
    timeDuration: number;
    duration: string;
    description: string;
    status: string;
    browser: string;
    tags: string[];
    preConditions: string[];
    steps: string[];
    postConditions: string[];
    statusIcon: string;
    videoPath: string | null;
    screenshotPaths: string[];
    attachments: { path: string; name: string }[];
    errors: string[];
    a11yReportPath?: string;
    executionReportPath?: string;
    a11yErrors?: A11yError[];
    a11yErrorCount?: number;
}

export interface TestSummary {
    duration: string;
    status: string;
    statusIcon: string;
    total: number;
    totalPassed: number;
    totalFailed: number;
    totalFlaky: number;
    totalSkipped: number;
    groupedResults: { [key: string]: TestResults[] };
    wcagErrors: { [key: string]: { count: number; severity: string; helpUrl?: string; description?: string } };
    totalA11yErrorCount: number;
    browserSummaries?: { [browser: string]: TestSummary };
}


export enum TestStatusIcon {
    passed = 'check_circle',
    failed = 'cancel',
    skipped = 'remove_circle',
    timedOut = 'alarm_off',
    interrupted = 'block'
}
