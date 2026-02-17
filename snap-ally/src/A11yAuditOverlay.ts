import { Page, TestInfo, test } from '@playwright/test';

export interface AuditAnnotation {
    type: string;
    description: string;
    keyPage: string;
}

/**
 * Handles visual feedback and Playwright annotations during an accessibility audit.
 */
export class A11yAuditOverlay {
    private readonly overlayRootId = 'a11y-audit-overlay-root';
    private auditAnnotations: AuditAnnotation[] = [];

    constructor(protected page: Page, protected keyPage: string) {}

    public reset() {
        this.auditAnnotations = [];
    }

    /**
     * Shows a compact, modern banner at the bottom of the page describing the violation.
     */
    async showViolationOverlay(violation: { id: string; help: string; }, color: string) {
        await this.page.evaluate(
            ([v, color, rootId]) => {
                let root = document.getElementById(rootId);
                if (!root) {
                    root = document.createElement('div');
                    root.id = rootId;
                    root.style.cssText = 'position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;';
                    document.body.appendChild(root);
                    root.attachShadow({ mode: 'open' });
                }

                const shadow = root.shadowRoot!;
                let container = shadow.getElementById('a11y-banner');
                
                if (!container) {
                    const style = document.createElement('style');
                    style.textContent = `
                        #a11y-banner {
                            position: fixed;
                            left: 50%;
                            bottom: 24px;
                            transform: translateX(-50%);
                            width: calc(100% - 40px);
                            max-width: 600px;
                            padding: 12px 18px;
                            border-radius: 12px;
                            color: white;
                            font-family: system-ui, -apple-system, sans-serif;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            gap: 12px;
                            box-shadow: 0 12px 40px rgba(0,0,0,0.3);
                            backdrop-filter: blur(16px) saturate(180%);
                            -webkit-backdrop-filter: blur(16px) saturate(180%);
                            border: 1px solid rgba(255,255,255,0.15);
                            z-index: 10000;
                        }
                        .badge {
                            background: rgba(255, 255, 255, 0.2);
                            padding: 2px 8px;
                            border-radius: 6px;
                            font-size: 11px;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                            border: 1px solid rgba(255,255,255,0.2);
                        }
                        .content {
                            flex: 1;
                            line-height: 1.4;
                            font-weight: 500;
                            overflow: hidden;
                        }
                    `;
                    shadow.appendChild(style);

                    container = document.createElement('div');
                    container.id = 'a11y-banner';
                    shadow.appendChild(container);
                }

                const alphaColor = color.includes('rgba') ? color : 
                    (color.includes('rgb') ? color.replace('rgb', 'rgba').replace(')', ', 0.85)') : color + 'E6');
                container.style.backgroundColor = alphaColor;
                
                container.innerHTML = `
                    <div style="font-size: 20px;">⚠️</div>
                    <div class="content">
                        <div style="margin-bottom: 4px; display: flex; align-items: center; gap: 8px;">
                            <span class="badge">${v.id}</span>
                            <span style="opacity: 0.9;">${v.help}</span>
                        </div>
                    </div>
                `;
            },
            [violation, color, this.overlayRootId] as [{id: string, help: string, selector: string}, string, string]
        );
    }

    /**
     * Removes the violation description overlay.
     */
    async hideViolationOverlay() {
        await this.page.evaluate((rootId) => {
            const el = document.getElementById(rootId);
            if (el) el.remove();
        }, this.overlayRootId);
    }

    /**
     * Attaches accessibility data to the Playwright test report.
     */
    async addTestAttachment(testInfo: TestInfo, name: string, description: string) {
        await testInfo.attach(name, {
            contentType: 'application/json',
            body: Buffer.from(description)
        });
    }

    getAuditAnnotations(): AuditAnnotation[] {
        return this.auditAnnotations;
    }

    /**
     * Captures a screenshot and attaches it to the test report.
     */
    async captureAndAttachScreenshot(fileName: string, testInfo: TestInfo): Promise<Buffer> {
        return await test.step('Capture A11y screenshot', async () => {
            // Use viewport screenshot instead of fullPage to avoid browser resizing flashes
            const screenshot = await this.page.screenshot({ fullPage: false });
            await testInfo.attach(fileName, { contentType: 'image/png', body: screenshot });
            return screenshot;
        });
    }

    async highlightElement(selector: string, color: string) {
        await this.page.evaluate(([sel, color, rootId]) => {
            const target = document.querySelector(sel) as HTMLElement;
            if (!target) return;

            // Scroll FIRST to ensure accurate coordinates after scroll
            target.scrollIntoView({ behavior: 'auto', block: 'center' });

            let root = document.getElementById(rootId);
            if (!root) {
                root = document.createElement('div');
                root.id = rootId;
                root.style.cssText = 'position: absolute; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;';
                document.body.appendChild(root);
                root.attachShadow({ mode: 'open' });
            }

            const shadow = root.shadowRoot!;
            let highlight = shadow.getElementById('a11y-highlight');
            if (!highlight) {
                const style = document.createElement('style');
                style.textContent = `
                    #a11y-highlight {
                        position: absolute;
                        pointer-events: none;
                        border-radius: 8px;
                        box-sizing: border-box;
                        z-index: 9999;
                        box-shadow: 0 0 0 4px var(--c-alpha), 0 0 20px var(--c-alpha);
                    }
                    .glow {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        border-radius: inherit;
                        border: 2px solid var(--c);
                    }
                `;
                shadow.appendChild(style);

                highlight = document.createElement('div');
                highlight.id = 'a11y-highlight';
                highlight.innerHTML = '<div class="glow"></div>';
                shadow.appendChild(highlight);
            }

            const rect = target.getBoundingClientRect();
            highlight.style.left = `${rect.left + window.scrollX - 4}px`;
            highlight.style.top = `${rect.top + window.scrollY - 4}px`;
            highlight.style.width = `${rect.width + 8}px`;
            highlight.style.height = `${rect.height + 8}px`;
            highlight.style.border = `3px solid ${color}`;
            highlight.style.setProperty('--c', color);
            highlight.style.setProperty('--c-alpha', color.includes('rgba') ? color.replace(/[\d.]+\)$/, '0.3)') : color + '4D');
        }, [selector, color, this.overlayRootId] as [string, string, string]);
    }

    /**
     * Removes highlighting from an element.
     */
    async unhighlightElement() {
        await this.page.evaluate((rootId) => {
            const root = document.getElementById(rootId);
            if (root && root.shadowRoot) {
                const highlight = root.shadowRoot.getElementById('a11y-highlight');
                if (highlight) highlight.remove();
            }
        }, this.overlayRootId);
    }
}
