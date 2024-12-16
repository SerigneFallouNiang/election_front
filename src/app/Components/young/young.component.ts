import { Component, inject, OnInit } from '@angular/core';
import { YoungService } from '../../Services/young.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import galsenify from 'galsenify';



@Component({
  selector: 'app-young',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './young.component.html',
  styleUrl: './young.component.css'
})
export class YoungComponent implements OnInit {
  private youngService = inject(YoungService);
  
 // Déclaration des propriétés
youngs: any[] = [];
filteredYoungs: any[] = [];
filtered: FormGroup;

 // Listes uniques pour les filtres
 regions: string[] = [];
 departements: string[] = [];
 communes: string[] = [];

constructor(private fb: FormBuilder) {
  // Initialisation du formulaire avec des contrôles imbriqués
  this.filtered = this.fb.group({
    region: [''],
    department: [''],
    commune: ['']
  });
}
  

 


  ngOnInit(): void {
    this.fetchYoung();
    this.chargerRegions();

    // Écouter les changements de formulaire pour filtrer dynamiquement
    this.filtered.valueChanges.subscribe(() => {
      this.filterYoungs();
    });

  }

  chargerRegions() {
    this.regions = galsenify.regions() || [];
    console.log('Loaded Regions:', this.regions);

  }

  onChangementRegion() {
    const selectedRegion = this.filtered.get('region')?.value;
    if (selectedRegion) {
      console.log('Selected Region:', selectedRegion);
      try {
        this.departements = galsenify.departments(selectedRegion) || [];
        console.log('Departments for ' + selectedRegion + ':', this.departements);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
      this.communes = []; 
      this.filtered.get('department')?.reset(); 
      this.filtered.get('commune')?.reset(); 
    }
  }

  //selection de département
  onChangementDepartement() {
    const selectedDepartement = this.filtered.get('department')?.value;
  
    if (selectedDepartement) {
      this.communes = galsenify.communes(selectedDepartement) || [];
      this.filtered.get('commune')?.reset(); // Réinitialiser la commune
    }

    this.filterYoungs(); // Mettre à jour le filtre

  }

  filterYoungs() {
    const { region, department, commune } = this.filtered.value;

    this.filteredYoungs = this.youngs.filter(young => {
      const matchesRegion = !region || (young.address && young.address.region === region);
      const matchesDepartment = !department || (young.address && young.address.department === department);
      const matchesCommune = !commune || (young.address && young.address.commune === commune);
      return matchesRegion && matchesDepartment && matchesCommune;
    });
  }


  fetchYoung() {
    this.youngService.getAllYoungs().subscribe(
      (response: any) => {
        this.youngs = response.data;
        this.filteredYoungs = this.youngs;
    
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des jeunes:', error);
      }
    );
  }

  // onChangementRegion() {
  //   const selectedRegion = value;
  //   if (selectedRegion) {
  //     console.log('Selected Region:', selectedRegion);
  //     try {
  //       this.departements = galsenify.departments(selectedRegion) || [];
  //       console.log('Departments for ' + selectedRegion + ':', this.departements);
  //     } catch (error) {
  //       console.error('Error fetching departments:', error);
  //     }
  //     this.communes = []; 
  //     this.filtered.get('department')?.reset(); 
  //     this.filtered.get('commune')?.reset(); 
  //   }
  // }
  
}