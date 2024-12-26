import { Component, inject, OnInit } from '@angular/core';
import { YoungService } from '../../Services/young.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import galsenify from 'galsenify';
import { apiUrlStockage } from '../../Services/apiUrlStockage';

@Component({
  selector: 'app-young',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './young.component.html',
  styleUrl: './young.component.css'
})
export class YoungComponent implements OnInit {
  private youngService = inject(YoungService);
  
  youngs: any[] = [];
  filteredYoungs: any[] = [];
  filtered: FormGroup;
  documents: any[] = [];
  regions: string[] = [];
  departements: string[] = [];
  communes: string[] = [];
  protected Math = Math;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  
  constructor(private fb: FormBuilder) {
    this.filtered = this.fb.group({
      region: [''],
      department: [''],
      commune: ['']
    });
  }

  ngOnInit(): void {
    this.fetchYoung();
    this.chargerRegions();

    this.filtered.valueChanges.subscribe(() => {
      this.currentPage = 1; // Reset to first page when filters change
      this.filterYoungs();
    });
  }

  get paginatedYoungs() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredYoungs.slice(startIndex, endIndex);
  }

  get totalPages() {
    return Math.ceil(this.filteredYoungs.length / this.pageSize);
  }

  get pages() {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  chargerRegions() {
    this.regions = galsenify.regions() || [];
  }

  onChangementRegion() {
    const selectedRegion = this.filtered.get('region')?.value;
    if (selectedRegion) {
      try {
        this.departements = galsenify.departments(selectedRegion) || [];
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
      this.communes = []; 
      this.filtered.get('department')?.reset(); 
      this.filtered.get('commune')?.reset(); 
    }
  }

  onChangementDepartement() {
    const selectedDepartement = this.filtered.get('department')?.value;
    if (selectedDepartement) {
      this.communes = galsenify.communes(selectedDepartement) || [];
      this.filtered.get('commune')?.reset();
    }
    this.filterYoungs();
  }

  filterYoungs() {
    const { region, department, commune } = this.filtered.value;
    this.filteredYoungs = this.youngs.filter(young => {
      const matchesRegion = !region || (young.address && young.address.region === region);
      const matchesDepartment = !department || (young.address && young.address.department === department);
      const matchesCommune = !commune || (young.address && young.address.commune === commune);
      return matchesRegion && matchesDepartment && matchesCommune;
    });
    this.totalItems = this.filteredYoungs.length;
  }

  fetchYoung() {
    this.youngService.getAllYoungs().subscribe(
      (response: any) => {
        this.youngs = response.data;
        this.filteredYoungs = this.youngs;
        this.totalItems = this.youngs.length;
        
        this.youngs.forEach(young => {
          if (young.documents) {
            young.documents = `${apiUrlStockage}/${young.documents}`;
          }
        });    
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des jeunes:', error);
      }
    );
  }
}