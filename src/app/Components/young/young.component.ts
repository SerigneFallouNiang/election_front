import { Component, inject, OnInit } from '@angular/core';
import { YoungService } from '../../Services/young.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import galsenify from 'galsenify';




@Component({
  selector: 'app-young',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './young.component.html',
  styleUrl: './young.component.css'
})
export class YoungComponent implements OnInit {
  private youngService = inject(YoungService);
  
  youngs: any[] = [];
  filteredYoungs: any[] = [];
  
  // Filtres
  searchTerm: string = '';
  selectedDepartment: string = '';
  selectedCommune: string = '';

  // Listes uniques pour les filtres
  departments: string[] = [];
  communes: string[] = [];

  galsenify = require("galsenify");

  ngOnInit(): void {
    this.fetchYoung();
    this.initializeFilters();
  }


  initializeFilters() {
  // Charger les départements via Galsenif
  this.departments = this.galsenify.departments(); 
  
  // Charger les communes via Galsenify (optionnel, selon vos besoins)
  this.communes = this.galsenify.sn().communes; 
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
  
}