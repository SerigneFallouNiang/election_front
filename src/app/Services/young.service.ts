import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { apiUrl } from './apiUrl';

@Injectable({
  providedIn: 'root'
})
export class YoungService {

  private http = inject(HttpClient);

  // Methode pour recuperer la liste des jeunes 
  getAllYoungs(){
    return this.http.get(`${apiUrl}/youngs`);
}


addYoung(youngData: FormData) {
  return this.http.post(`${apiUrl}/young`, youngData);
}


}
