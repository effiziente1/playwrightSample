import test, { Page } from '@playwright/test';
import { ApiHelper } from '../../utils/ApiHelper';
import { AnnotationHelper } from '../../utils/annotations/AnnotationHelper';
import { User } from './Users';

export class UsersApi {

    private apiHelper: ApiHelper;
    private annotationHelper: AnnotationHelper;

    constructor(private page: Page) {
        const baseURL = process.env.EFFIZIENTE_API_URL!;
        this.annotationHelper = new AnnotationHelper(this.page, 'usersApi');
        this.apiHelper = new ApiHelper(this.page, baseURL, this.annotationHelper);
    }

    async getCurrentUser(): Promise<User> {
        return await test.step('Get the info for the current user', async () => {
            const response = await this.apiHelper.get('api/Users/Current');
            // eslint-disable-next-line playwright/no-conditional-in-test
            if (response.status() === 200) {
                const user: User = JSON.parse(await response.text());
                return user;
            }
            else {
                throw new Error(`Failed to get current user. Status: ${response.status()} ${response.statusText()}`);
            }
        });
    }
}