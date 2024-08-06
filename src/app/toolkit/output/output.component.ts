import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-output',
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.css']
})
export class OutputComponent implements OnInit {

  // Template variables updated from parent toolkit
  @Input() model: string;
  @Input() outputData: Object;
  @Input() progress: string;
  

  constructor() { }

  ngOnInit(): void {
  }

  // Checks if object is empty (used in template to check for outputData)
  isEmpty(output: Object) {
    return Object.keys(output).length === 0;
  }

}
