import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Corbado from '@corbado/web-js';
import { db } from '../../shared/prompt-db';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{
  
  constructor(private router: Router) {}
 
  async ngOnInit() {
      // Load and initialize Corbado SDK when the component mounts
      await Corbado.load({
          projectId: "pro-0317338422706138772",
          darkMode: 'off',
          theme: "ollaroo-passkey"
      });
      const authElement = document.getElementById("corbado-auth");
      if (authElement) {
          // mount Corbado auth UI for the user to sign in or sign up
          Corbado.mountAuthUI(authElement, {
              onLoggedIn: () => {
                  console.log(Corbado.shortSession)
                  db.addAuthToken({
                    token:Corbado.shortSession
                  });
                  this.router.navigate(['/chat'])
              }
        })
      }
  }
}
