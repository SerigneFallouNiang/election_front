import { Component, inject } from '@angular/core';
import { AuthService } from '../../../Services/auth.service';
import { Router, RouterModule } from '@angular/router';
import {FormControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { error } from 'console';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  authService = inject(AuthService);
  router = inject(Router);

  errorMessage: string = '';
  showPassword = false;

  protected loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.status) {
            // Stockage du token et des informations utilisateur
            localStorage.setItem('token', JSON.stringify({
              token: response.token,
              user: response.user
            }));
            
            // Redirection selon le rôle
            if (response.user.role === 'Admin') {
              this.router.navigate(['/add-young']);
            } else {
              this.router.navigate(['/young']);
            }
          } else {
            this.displayError('Identifiants incorrects');
          }
        },
        error: (error) => {
          console.error('Erreur de connexion:', error);
          this.displayError('Email ou mot de passe incorrect');
        }
      });
    } else {
      this.displayError('Veuillez remplir tous les champs correctement.');
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Ajout de la méthode displayError
  private displayError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 2000);
  }
}
