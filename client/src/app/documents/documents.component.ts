import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrl: './documents.component.css'
})
export class DocumentsComponent implements OnInit, OnDestroy{
  constructor(){
    
  }
  
  ngOnInit(): void {
    
  }
  ngOnDestroy(): void {
    
  }

  searchQuery: string = '';

  clearSearch(): void {
    this.searchQuery = '';
  }

  goBack(){

  }
}
