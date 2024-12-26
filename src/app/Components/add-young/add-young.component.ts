import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import galsenify from 'galsenify';
import { YoungService } from '../../Services/young.service';

@Component({
  selector: 'app-add-young',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-young.component.html',
  styleUrl: './add-young.component.css'
})
export class AddYoungComponent implements OnInit {
  private youngService = inject(YoungService);

  formJeune: FormGroup;
  regions: string[] = [];
  departements: string[] = [];
  communes: string[] = [];
  fichiersSelectionnes: File[] = [];

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
  }

  chargerRegions() {
    this.regions = galsenify.regions() || [];
  }

  onChangementRegion() {
    const selectedRegion = this.formJeune.get('address.region')?.value;
    if (selectedRegion) {
      this.departements = galsenify.departments(selectedRegion) || [];
      this.communes = []; 
      this.formJeune.get('address.department')?.reset();
      this.formJeune.get('address.commune')?.reset();
    }
  }

  onChangementDepartement() {
    const selectedDepartement = this.formJeune.get('address.department')?.value;
    if (selectedDepartement) {
      this.communes = galsenify.communes(selectedDepartement) || [];
      this.formJeune.get('address.commune')?.reset();
    }
  }

  onSelectionFichiers(event: any) {
    const files = event.target.files;
    if (files) {
      this.fichiersSelectionnes = Array.from(files);
    }
  }

  onSoumettre() {
    if (this.formJeune.valid) {
      const formData = new FormData();
      
      // Ajouter les champs du formulaire
      const rawFormData = this.formJeune.value;
      Object.keys(rawFormData).forEach(key => {
        if (key !== 'documents' && key !== 'address') {
          formData.append(key, rawFormData[key]);
        }
      });

      // Ajouter l'adresse
      formData.append('address[region]', rawFormData.address.region);
      formData.append('address[department]', rawFormData.address.department);
      formData.append('address[commune]', rawFormData.address.commune);
      formData.append('address[quartier]', rawFormData.address.quartier);

      // Ajouter les documents
      this.fichiersSelectionnes.forEach((file, index) => {
        formData.append(`documents[]`, file);
      });

      // Convertir les valeurs booléennes et dates
      formData.set('is_elector', rawFormData.is_elector ? '1' : '0');
      formData.set('birth_date', this.formatDateToISO(rawFormData.birth_date));

      // Envoyer les données
      this.youngService.addYoung(formData).subscribe({
        next: (reponse) => {
          console.log('Jeune ajouté avec succès', reponse);
          this.formJeune.reset();
          this.fichiersSelectionnes = [];
        },
        error: (erreur) => {
          console.error('Détails de l\'erreur:', erreur.error);
        }
      });
    }
  }

  formatDateToISO(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
}