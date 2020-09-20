import {HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpRequest, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';

export interface UploadProgress {
    progress?: number;
    complete: boolean;
    error: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class HttpService {
    constructor(private httpClient: HttpClient) {
    }

    public get<T>(url: string, parameters: {[param: string]: string} = null): Observable<T> {
        let headers = new HttpHeaders();
        headers = this.addContentHeader(headers);

        return this.httpClient.get<T>(url, {
            headers: headers,
            params: parameters
        });
    }

    public post<T>(url: string, data: any): Observable<T> {
        let headers = new HttpHeaders();
        headers = this.addContentHeader(headers, data);

        return this.httpClient.post<T>(url, data, {
            headers: headers
        });
    }

    public upload(url: string, files: File[]): Observable<UploadProgress> {
        const formData = new FormData();

        for (let file of files) {
            formData.append(file.name, file);
        }

        const req = new HttpRequest('POST', url, formData, {
            reportProgress: true
        });
        return this.httpClient.request(req).pipe<UploadProgress>(
            mergeMap(event => {
                if (event.type === HttpEventType.UploadProgress) {
                    return of({
                        progress: Math.round(100 * event.loaded / event.total),
                        complete: false,
                        error: false
                    } as UploadProgress);
                } else if (event instanceof HttpResponse) {
                    return of({
                        progress: 100,
                        complete: true,
                        error: false
                    } as UploadProgress);
                } else {
                    return of({
                        complete: false,
                        error: false
                    } as UploadProgress)
                }
            })
        );
    }

    private addContentHeader(headers: HttpHeaders, data: any = null): HttpHeaders {
        if (data instanceof FormData) {
            return headers;
        }
        return headers.set('Content-Type', 'application/json');
    }
}
