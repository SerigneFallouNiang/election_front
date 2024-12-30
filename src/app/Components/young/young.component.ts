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

  selectedYoungs: Set<number> = new Set(); // Pour stocker les IDs des jeunes sélectionnés
  selectAll: boolean = false;


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
      this.selectedYoungs.clear(); // Réinitialiser les sélections lors du filtrage
      this.selectedYoungs.clear(); // Réinitialiser les sélections lors du filtrage
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


  //Methode pour l'exportation du tableaux
  // Méthodes de gestion des sélections
  toggleSelection(youngId: number) {
    if (this.selectedYoungs.has(youngId)) {
      this.selectedYoungs.delete(youngId);
    } else {
      this.selectedYoungs.add(youngId);
    }
    this.updateSelectAllStatus();
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    if (this.selectAll) {
      this.paginatedYoungs.forEach(young => this.selectedYoungs.add(young.id));
    } else {
      this.selectedYoungs.clear();
    }
  }

  updateSelectAllStatus() {
    this.selectAll = this.paginatedYoungs.every(young => this.selectedYoungs.has(young.id));
  }

  isSelected(youngId: number): boolean {
    return this.selectedYoungs.has(youngId);
  }

  // Méthode d'export
  exportSelectedData() {
    if (this.selectedYoungs.size === 0) {
      alert('Veuillez sélectionner au moins une ligne à exporter');
      return;
    }

    const selectedData = this.filteredYoungs.filter(young => this.selectedYoungs.has(young.id));
    const csvData = this.convertToCSV(selectedData);
    this.downloadCSV(csvData);
  }

  private convertToCSV(data: any[]): string {
    const headers = ['Nom', 'Prénom', 'NCI', 'Téléphone', 'Région', 'Département', 'Commune'];
    const rows = data.map(young => [
      young.last_name,
      young.first_name,
      young.id_card_number,
      young.phone,
      young.address?.region || '',
      young.address?.department || '',
      young.address?.commune || ''
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  private downloadCSV(csvContent: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `export_recensement_${new Date().toISOString()}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}