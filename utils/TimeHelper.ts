export class TimeHelper {
    formatDuration(milliseconds: number): string {
        if (milliseconds < 1000) {
            return `${milliseconds.toFixed(0)}ms`;
        }

        const seconds = milliseconds / 1000;
        if (seconds < 60) {
            return `${seconds.toFixed(1)}s`;
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}min ${remainingSeconds.toFixed(0)}s`;
    }
}