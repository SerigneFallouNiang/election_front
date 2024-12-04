import { Routes } from '@angular/router';
import { YoungComponent } from './Components/young/young.component';
import { AddYoungComponent } from './Components/add-young/add-young.component';

export const routes: Routes = [
    {path: "", pathMatch: "full", redirectTo: "young"},
    {path: "young", component : YoungComponent},
    {path: "add-young", component : AddYoungComponent},
];
