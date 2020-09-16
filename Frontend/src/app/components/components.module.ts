import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ComponentsList} from './components.list';
import {RoutingModule} from '../routing.module';

import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';

import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RoutingModule,

    MatToolbarModule,
    MatCardModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  declarations: [
    ...ComponentsList
  ],
  entryComponents: [
  ]
})
export class ComponentsModule {}
