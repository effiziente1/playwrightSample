import { TestResults } from './TestResults';

export interface TestSummary {
    duration: string;
    status: string;
    statusIcon: string;
    total: number;
    totalPassed: number;
    totalFailed: number;
    totalFlaky: number;
    totalSkipped: number;
    groupedResults: Record<string, TestResults[]>
}