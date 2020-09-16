import {NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {MainAppComponent} from './components/main-app/main-app.component';
import {ComponentsModule} from './components/components.module';
import {ErrorInterceptor} from './interceptors/error-interceptor';
import {JwtInterceptor} from './interceptors/jwt-interceptor';

@NgModule({
  imports: [
    ComponentsModule,
    HttpClientModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  bootstrap: [MainAppComponent]
})
export class AppModule { }
