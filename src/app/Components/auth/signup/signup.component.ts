import { Component } from '@angular/core';
import { inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';

interface SignupFormData {
  name: string | null;
  email: string | null;
  password: string | null;
  password_confirmation?: string | null;
  phone: string | null;
  id_card_number: string | null;
  birth_date: string | null;
  role: string | null;
  address: string[];
}

interface AddressFormData {
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  authService = inject(AuthService);
  router = inject(Router);
  showPassword = false;
  showConfirmPassword = false;
  errorMessage: string = '';

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const passwordConfirmation = control.get('password_confirmation');
      if (password && passwordConfirmation && password.value !== passwordConfirmation.value) {
        return { 'passwordMismatch': true };
      }
      return null;
    };
  }

  public signupForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(4)]),
    password_confirmation: new FormControl('', [Validators.required]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{9,15}$')]),
    id_card_number: new FormControl(''),
    birth_date: new FormControl('', [Validators.required]),
    role: new FormControl('Agent'),
    address: new FormGroup({
      street: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      postal_code: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required])
    })
  }, { validators: this.passwordMatchValidator() });

  onSubmit() {
    if (this.signupForm.valid) {
      const formValues = this.signupForm.value;
      const addressValues = formValues.address as AddressFormData;
      
      const dataToSend = {
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
        password_confirmation: formValues.password_confirmation, // Inclure la confirmation du mot de passe
        phone: formValues.phone,
        id_card_number: formValues.id_card_number,
        birth_date: formValues.birth_date,
        role: formValues.role,
        address: Object.values(addressValues).filter((value): value is string => 
          value !== null && value !== undefined
        )
      };

      this.authService.signup(dataToSend).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.router.navigate(['/login']);
          } else {
            this.displayError(response.message || 'Erreur lors de l\'inscription');
          }
        },
        error: (error) => {
          console.error('Erreur d\'inscription:', error);
          // Amélioration du message d'erreur
          const errorMessage = error.error?.message || error.error?.errors?.password?.[0] || 'Erreur lors de l\'inscription';
          this.displayError(errorMessage);
        }
      });
    } else {
      this.displayError('Veuillez remplir correctement tous les champs obligatoires');
      this.signupForm.markAllAsTouched();
    }
  }

  private displayError(message: string) {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 3000);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.signupForm.get(controlName);
    return control ? control.errors?.[errorName] && control.touched : false;
  }

  getAddressControl(controlName: string): AbstractControl | null {
    return this.signupForm.get(`address.${controlName}`);
  }
}