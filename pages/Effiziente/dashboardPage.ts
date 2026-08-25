import { Page, expect } from '@playwright/test';
import { EffizienteBasePage } from './effizienteBasePage';
import { AnnotationType } from '../../utils/annotations/AnnotationType';
import { Heading } from '../../components/Heading';
import { Canvas } from '../../components/Canvas';
import { VisualHelper } from '../../utils/VisualHelper';

export class DashboardPage extends EffizienteBasePage {
    readonly title: Heading;
    readonly top5: Canvas;
    readonly top5Debt: Canvas;
    readonly top5DaysDelay: Canvas;
    readonly summaryExpiration: Canvas;
    protected visualHelper = new VisualHelper(this.page, this.keyPage);

    constructor(page: Page) {
        super(page, 'Dashboard');
        const noByRole = false;
        this.title = new Heading(page, this.annotationHelper, '.page-header', noByRole);
        this.top5 = new Canvas(page, this.annotationHelper, '#top5');
        this.top5Debt = new Canvas(page, this.annotationHelper, '#top5-debt');
        this.top5DaysDelay = new Canvas(
            page,
            this.annotationHelper,
            '#top5-type-delay',
        );
        this.summaryExpiration = new Canvas(
            page,
            this.annotationHelper,
            '#summary-expiration',
        );
    }

    /**
   * Go to dashboard page
   */
    public async goTo() {
        const dashboardPage = this.baseURL + '/accounts-receivable/dashboard';
        await this.addStepWithAnnotation(
            AnnotationType.GoTo,
            `Go to: "${dashboardPage}"`,
            async () => {
                await this.page.goto(dashboardPage);
                await this.title.locator.waitFor({ timeout: 30_000 });
            },
        );
    }

    /**
   * Wait to load the charts
   */
    public async waitForChartsAreVisible() {
        await this.addStepWithAnnotation(
            AnnotationType.GoTo,
            'Wait to charts are visible',
            async () => {
                await expect(this.page.locator(this.top5.selector)).toBeVisible();
                await expect(this.page.locator(this.top5Debt.selector)).toBeVisible();
                await expect(
                    this.page.locator(this.top5DaysDelay.selector),
                ).toBeVisible();
                await expect(
                    this.page.locator(this.summaryExpiration.selector),
                ).toBeVisible();

                await this.top5.waitForStable();
                await this.top5Debt.waitForStable();
                await this.top5DaysDelay.waitForStable();
                await this.summaryExpiration.waitForStable();
            },
        );
    }

    /**
   * Check snapshot
   */
    public async checkSnapshot() {
        await this.visualHelper.checkPageSnapshot('dashboard.png', 10_000);
    }
}
