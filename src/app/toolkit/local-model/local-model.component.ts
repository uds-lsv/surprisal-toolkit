import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-local-model',
  templateUrl: './local-model.component.html',
  styleUrls: ['./local-model.component.css']
})
export class LocalModelComponent implements OnInit {

  // Import debug boolean from parent app.component
  @Input() DEBUG = true;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  /* Declare form group */
  localModelForm = new FormGroup({
    modelFolder: new FormControl(null),
    modelFolderPath: new FormControl('')
  })

  // Variables to hide or show elements
  showLocalModelContainer: boolean = false;

  // Keep track of user form submission
  submitConfirmed: boolean = false;

  // Initialize event emitter to send localModels data to toolkit component
  @Output() localModelEvent = new EventEmitter<Object>();

  // (Optional template variable, but not used here)
  localModels: Object = {};

  // Event emitter method to send localModels to toolkit component (see localModelEvent in toolkit template)
  sendLocalModels(localModels: Object){
    this.localModelEvent.emit(localModels)
  }

  /* Show or hide local model upload container (for running locally) */
  toggleLocalModelContainer(event: any) {
    this.showLocalModelContainer = !this.showLocalModelContainer;
  }

  /* Local model folder upload (for running locally) */
  uploadModelFolder(event: any) {
    console.log("uploadLocalModel() called", event.target.files);
  }

  /* Confirm form submission */
  confirmSubmit() {
    this.submitConfirmed = true;
    if(this.DEBUG){ console.log("confirmSubmit()"); }
  }

  /* Submit form */
  submitForm(event: SubmitEvent) { 
    
    // Prevent the browser's early form submission
    event.preventDefault();

    // Debugging
    if(this.DEBUG){ console.log("local model submitForm() called: ", this.localModelForm.value); }

    // Create FormData object to send in POST request
    let formData: any = new FormData();

    // Add model folder path
    formData.set('modelFolderPath', this.localModelForm.get('modelFolderPath').value);

    // Only send POST request if path is given and submit button pressed
    if (formData.get('modelFolderPath') !== "" && this.submitConfirmed) {
      this.postFormData(formData); 
    }
  }

  /* Send formData as POST request, retrieve and store response */
  postFormData(formData: any) {

    // Send formData as POST request to backend main.py
    if(this.DEBUG){ console.log("Sending local model POST request."); }
    this.http
      .post("/upload-models", formData)
      .subscribe({
        // Retrieve computed response
        next: (response) => {
          if(this.DEBUG) { console.log("response:", response); }
          // Store response and send to parent component
          this.localModels = response
          this.sendLocalModels(this.localModels)
        },
        error: (error) => console.log("error:", error)
      });
  }

}
