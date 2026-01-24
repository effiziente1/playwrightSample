/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIRequestContext, APIResponse, Page, Response } from 'playwright';
import { IApiHelper } from './IApiHelper';
import { AnnotationHelper } from './annotations/AnnotationHelper';
import test, { request } from '@playwright/test';
import { AnnotationType } from './annotations/AnnotationType';
import { pwApi } from 'pw-api-plugin';

export class PWApiHelper implements IApiHelper {

    annotationHelper: AnnotationHelper;
    baseUrl: string;
    page: Page;

    constructor(page: Page, baseUrl: string, annotationHelper: AnnotationHelper) {
        this.page = page;
        this.baseUrl = baseUrl;
        this.annotationHelper = annotationHelper;
    }

    async createRequest(baseURL: string) {
        const token = await this.page.evaluate('localStorage["token"]');
        const apiRequest: APIRequestContext = await request.newContext({
            baseURL: baseURL,
            extraHTTPHeaders: {
                'Authorization': `Bearer ${token}`,
            }
        });
        return apiRequest;
    }

    /**
     * Wait for response from url contains the api url
     * @param apiUrl api url to wait until get the response 
     * @param statusCode Status code returned by the api
     * @returns responsePromise
     */
    waitForResponse(apiUrl: string, statusCode = 200, method: 'POST' | 'GET' | 'PUT' | 'DELETE' = 'GET'): Promise<Response> {
        return this.page.waitForResponse(response => response.url().includes(apiUrl) && response.request().method() == method
            && response.status() == statusCode);
    }


    async get(url: string): Promise<APIResponse> {
        const apiRequest = await this.createRequest(this.baseUrl);
        const response = await pwApi.get({ request: apiRequest }, url);
        return response;
    }

    async post(url: string, data: any): Promise<APIResponse> {
        const apiRequest = await this.createRequest(this.baseUrl);
        const response = await pwApi.post({ request: apiRequest }, url, { data: data });
        return response;
    }

    async put(url: string, data: any): Promise<APIResponse> {
        const apiRequest = await this.createRequest(this.baseUrl);
        const response = await pwApi.put({ request: apiRequest }, url, { data: data });
        return response;
    }

    async delete(url: string): Promise<APIResponse> {
        const apiRequest = await this.createRequest(this.baseUrl);
        return await pwApi.delete({ request: apiRequest }, url);
    }

    async mockApi(description: string, url: string, jsonData: any): Promise<void> {
        this.annotationHelper.addAnnotation(AnnotationType.Mock, description);

        await test.step(description, async () => {
            await this.page.route(url, async route => {
                await route.fulfill({ body: JSON.stringify(jsonData) });
            });
        });
    }
}