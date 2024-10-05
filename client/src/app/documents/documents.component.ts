import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit, OnDestroy{
  constructor(private router:Router){

  }
  
  ngOnInit(): void {
    
  }
  ngOnDestroy(): void {
    
  }

  searchQuery: string = '';

  clearSearch(): void {
    this.searchQuery = '';
  }

  searchDocuments(){

  }

  goBack(){
    this.router.navigate(['chat']);
  }
}
