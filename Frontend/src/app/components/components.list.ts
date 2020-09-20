import {MainAppComponent} from './main-app/main-app.component';
import {AppHeaderComponent} from './app-header/app-header.component';
import {LoginComponent} from './login/login.component';
import {NavigatorComponent} from './navigator/navigator.component';
// import {ErrorsListComponent} from './errors-list/errors-list.component';
// import {FileSelectorComponent} from './file-selector/file-selector.component';
import {SalesListComponent} from './sales-list/sales-list.component';
import {UsersListComponent} from './users-list/users-list.component';
import {CreateUserComponent} from './create-user/create-user.component';
import { EditableTableCellComponent } from './editable-table-cell/editable-table-cell.component';
import { CreateSalesDataComponent } from './create-sales-data/create-sales-data.component';
import { EditCellDialogComponent } from './edit-cell-dialog/edit-cell-dialog.component';
import { ImportSalesComponent } from './import-sales/import-sales.component';

export const ComponentsList = [
  MainAppComponent,
  AppHeaderComponent,
  LoginComponent,
  NavigatorComponent,
  // ErrorsListComponent,
  // FileSelectorComponent
  SalesListComponent,
  UsersListComponent,
  CreateUserComponent,
  EditableTableCellComponent,
  CreateSalesDataComponent,
  EditCellDialogComponent,
  ImportSalesComponent
];

export const EntryComponentsList = [
  EditCellDialogComponent
];
