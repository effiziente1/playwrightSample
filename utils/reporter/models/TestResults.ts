export interface TestResults {
    num: number,
    title: string,
    timeDuration: number,
    duration: string,
    fileName: string,
    description?: string,
    status: string,
    tags: string[],
    steps: string[],
    preConditions: string[],
    postConditions: string[],
    browser: string
    statusIcon: string,
    videoPath?: string,
    screenshotPaths?: string[],
    attachments?: { path: string, name: string }[],
    errors?: string[]
}