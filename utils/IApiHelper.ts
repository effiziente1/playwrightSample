/* eslint-disable @typescript-eslint/no-explicit-any */
import { APIRequestContext, APIResponse, Page, Response } from '@playwright/test';
import { AnnotationHelper } from './annotations/AnnotationHelper';

export interface IApiHelper {
  page: Page;
  baseUrl: string;
  annotationHelper: AnnotationHelper;

  createRequest(baseURL: string): Promise<APIRequestContext>;
  waitForResponse(apiUrl: string, statusCode?: number, method?: 'POST' | 'GET' | 'PUT' | 'DELETE'): Promise<Response>;
  get(url: string): Promise<APIResponse>;
  post(url: string, data: any): Promise<APIResponse>;
  put(url: string, data: any): Promise<APIResponse>;
  delete(url: string): Promise<APIResponse>;
  mockApi(description: string, url: string, jsonData: any): Promise<void>;
}