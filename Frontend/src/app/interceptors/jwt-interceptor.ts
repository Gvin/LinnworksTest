import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';
import {JwtService} from '../services/jwt-service/jwt.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private jwtService: JwtService) {
    }

    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const processedRequest = this.processRequest(request);
      return next.handle(processedRequest);
    }

    private processRequest(request: HttpRequest<any>): HttpRequest<any> {
      if (this.jwtService.getIfTokenExpired()) {
        return request;
      }

      const pureToken = this.jwtService.getPureJwtToken();
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${pureToken}`
        }
      });
    }
}
