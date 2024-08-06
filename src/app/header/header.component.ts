import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  // Variable to hide or show About
   showAbout: boolean = false;

  /* Show or hide "About" paragraph */
  toggleAbout(event: any) {
    this.showAbout = !this.showAbout;
  }

}
