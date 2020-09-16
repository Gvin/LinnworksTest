import {JwtHelperService} from '@auth0/angular-jwt';
import {Injectable} from '@angular/core';

const jwtLocalKey = 'jwt';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private jwtHelper: JwtHelperService;

  constructor() {
    this.jwtHelper = new JwtHelperService();
  }

  public getIfTokenExpired(): boolean {
    const token = this.getPureJwtToken();
    return this.jwtHelper.isTokenExpired(token);
  }

  public getDecodedJwtToken(): Map<string, string> {
    const token = this.getPureJwtToken();
    return this.jwtHelper.decodeToken(token);
  }

  public getPureJwtToken(): string {
    return localStorage.getItem(jwtLocalKey);
  }

  public setJwtToken(token: string): void {
    localStorage.setItem(jwtLocalKey, token);
  }

  public clearJwtToken(): void {
    localStorage.removeItem(jwtLocalKey);
  }
}
