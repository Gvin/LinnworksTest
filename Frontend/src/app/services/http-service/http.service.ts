import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

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

  private addContentHeader(headers: HttpHeaders, data: any = null): HttpHeaders {
    if (data instanceof FormData) {
      return headers;
    }
    return headers.set('Content-Type', 'application/json');
  }
}
