import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { apiUrl } from "./apiUrl";
import { tap } from 'rxjs/operators';
import { Observable } from "rxjs";

@Injectable({
    providedIn: "root"
})

export class AuthService {
    private http = inject(HttpClient);

    signup(data: any) {
        return this.http.post(`${apiUrl}/register`, data);
      }

      // Methode pour s'authetifier 
      login(identifiant:any){
        return this.http.post(`${apiUrl}/login`, identifiant);
    }


      logout() {
        localStorage.removeItem('token');
      }

  
      isLoggedIn() {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('token') !== null;
        }
        return false; 
      }
      

      // AuthService
      getProfile() {
        return this.http.get(`${apiUrl}/profile`);
      }

  

      updateProfile(userData: FormData): Observable<any> {
        return this.http.post(`${apiUrl}/update-profile`, userData);
      }
      

}