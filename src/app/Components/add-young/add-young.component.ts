import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import galsenify from 'galsenify';
import { YoungService } from '../../Services/young.service';

@Component({
  selector: 'app-add-young',
  standalone: true,
  imports: [CommonModule,FormsModule,ReactiveFormsModule,],
  templateUrl: './add-young.component.html',
  styleUrl: './add-young.component.css'
})
export class AddYoungComponent  implements OnInit{

  private youngService = inject(YoungService);

  formJeune: FormGroup;
  regions: string[] = [];
  departements: string[] = [];
  communes: string[] = [];
  fichiersSelectionnes: File[] = [];
  // galsenify = require("galsenify");


  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.formJeune = this.fb.group({
      first_name: ['', [Validators.required, Validators.maxLength(255)]],
      last_name: ['', [Validators.required, Validators.maxLength(255)]],
      birth_date: ['', Validators.required],
      id_card_number: ['', Validators.maxLength(20)],
      is_elector: [false, Validators.required],
      phone: ['', [Validators.required, Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      address: this.fb.group({
        region: ['', Validators.required],
        department: ['', Validators.required],
        commune: ['', Validators.required],
        quartier: ['', Validators.required]
      }),
      documents: [null]
    });
  }

  ngOnInit() {
    this.chargerRegions();
    // get all Senegal's regions
console.log(galsenify.regions());
console.log(galsenify.departments("Dakar"));
console.log('Regions:', this.regions);
  }

  chargerRegions() {
    this.regions = galsenify.regions() || [];
    console.log('Loaded Regions:', this.regions);

  }

  // onChangementRegion(region: string) {
  //   this.departements = this.galsenify.departments(region) || [];
  //   this.formJeune.get('address.department')?.reset();
  //   this.formJeune.get('address.commune')?.reset();
  // }

  onChangementRegion() {
    const selectedRegion = this.formJeune.get('address.region')?.value;
    if (selectedRegion) {
      console.log('Selected Region:', selectedRegion);
      try {
        this.departements = galsenify.departments(selectedRegion) || [];
        console.log('Departments for ' + selectedRegion + ':', this.departements);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
      this.communes = []; 
      this.formJeune.get('address.department')?.reset(); 
      this.formJeune.get('address.commune')?.reset(); 
    }
  }
  
  
//selection de département
  onChangementDepartement() {
    const selectedDepartement = this.formJeune.get('address.department')?.value;
  
    if (selectedDepartement) {
      this.communes = galsenify.communes(selectedDepartement) || [];
      this.formJeune.get('address.commune')?.reset(); // Réinitialiser la commune
    }
  }
  
  

  onSelectionFichiers(event: any) {
    this.fichiersSelectionnes = Array.from(event.target.files);
  }


  // //pour soumettre les données
  onSoumettre() {
    if (this.formJeune.valid) {
      // Utiliser un objet JSON standard au lieu de FormData
      const formData = this.formJeune.value;
  
      // Convertir le booléen pour is_elector
      formData.is_elector = formData.is_elector ? true : false;
  
      // Formater la date de naissance
      formData.birth_date = this.formatDateToISO(formData.birth_date);
  
      this.youngService.addYoung(formData)
        .subscribe({
          next: (reponse) => {
            console.log('Jeune ajouté avec succès', reponse);
            this.formJeune.reset();
          },
          error: (erreur) => {
            console.error('Détails de l\'erreur:', erreur.error);
          }
        });
    }
  }
  
  // Méthode pour formater la date
  formatDateToISO(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
  }
}
