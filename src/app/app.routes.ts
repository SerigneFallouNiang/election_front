import { Routes } from '@angular/router';
import { YoungComponent } from './Components/young/young.component';
import { AddYoungComponent } from './Components/add-young/add-young.component';
import { LoginComponent } from './Components/auth/login/login.component';
import { SignupComponent } from './Components/auth/signup/signup.component';

export const routes: Routes = [
    {path: "", pathMatch: "full", redirectTo: "young"},
    {path: "young", component : YoungComponent},
    {path: "add-young", component : AddYoungComponent},
    {path: "login", component : LoginComponent},
{path: "register", component : SignupComponent},
];
