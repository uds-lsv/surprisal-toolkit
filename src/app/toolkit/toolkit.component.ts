import { Component, Input, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Model } from './../model';

@Component({
  selector: 'app-toolkit',
  templateUrl: './toolkit.component.html',
  styleUrls: ['./toolkit.component.css']
})

export class ToolkitComponent implements OnInit {

  // Import debug boolean from parent app.component
  @Input() DEBUG = true;

  // List of models to be selected before computing
  modelList: Model[] = [new Model("gpt2", true, "", "gpt2-small"), 
                        new Model("gpt2-medium", true, "", ""), 
                        new Model("stefan-it/secret-gpt2", true, "", "German gpt2"), 
                        new Model("wikitext model", true, "self-trained"),
                        new Model("ai-forever/mGPT", true, "", "Multilingual GPT"),
                        new Model("openai-community/gpt2-large", true, "", "gpt2-large"),
                        new Model("openai-community/gpt2-xl", true, "", "gpt2-xl")];               

  // Class constructor                      
  constructor(public fb: FormBuilder, private http: HttpClient) {
    // Sort list of models for toolkit form
    this.modelList.sort((a,b) => (a.name > b.name) ? 1 : (a.name < b.name) ? -1 : 0);
    // this.modelList.unshift(new Model("wikitext model", true, "self-trained")) // add the wiki model here, so that it shows up first
  }
  
  // Class method invoked once
  ngOnInit() { 
  }

  /* Declare form group */
  toolkitForm = new FormGroup({
    model: new FormControl('', Validators.required),
    // batchSize: new FormControl(10),
    sentences: new FormControl(''),
    file: new FormControl(null),
    filename: new FormControl(''),
    prependToken: new FormControl(false)
  })

  /* Create attributes for file upload and template variable rendering */
  model: string = "";
  sentences: string = "";
  file: any = null;
  filename: string = "";

  // Keep track of user form submission
  submitConfirmed: boolean = false;

  // Store progress update string
  progressUpdate: string = "";

  // Initialize template variable for output data
  outputData: Object = {};

  // Populate model list with local models. Function call emitted from local-model component (see element tag)
  populateModelList(localModels: Object) {
    console.log("local models:", localModels)
    for (let modelName in localModels) {
      this.modelList.unshift(new Model(modelName, true));
    }
  }

  // Parse the received response into output for template (in case more parsing is needed later on)
  parseOutputResponse(response: Object) {
    return response
  }

  /* File upload */
  uploadFile(event: any) {
    if(this.DEBUG){ console.log("uploadFile()", event.target.files); }

    // Store file and file name in component attributes
    if (event.target.files.length > 0) {
      if(this.DEBUG){ console.log("--> length of event.target.files", event.target.files.length); }
      this.file = event.target.files[0];
      this.filename = event.target.files[0].name;
      
      // Account for empty files
    } else {
      if(this.DEBUG){ console.log("setting this.file = null and this.filename = ''"); }
      this.file = null;
      this.filename = "";
    }
  }

  /* Remove file */
  removeFile() {
    if(this.DEBUG){ console.log("removeFile()"); }
    this.filename = "";
    this.file = null;
  }
  
  /* Confirm form submission */
  confirmSubmit() {
    this.submitConfirmed = true;
    if(this.DEBUG){ console.log("confirmSubmit()"); }
  }

   /* Reset form */
  resetForm() {    
    this.submitConfirmed = false;
    this.resetProgressUpdate();
    if(this.DEBUG){ console.log("resetForm()", this.toolkitForm.value); }
  }

  /* Set progress update for results of form processing */
  setProgressUpdate(update: string) {
    this.progressUpdate = update;
  }
  resetProgressUpdate() {
    this.progressUpdate = "";
  }


  /* Form submission */
  submitForm(event: SubmitEvent) { 
    // Prevent the browser's early form submission
    event.preventDefault();

    // Debugging
    if(this.DEBUG){ console.log("submitForm() called: ", this.toolkitForm.value); }

    // Create FormData object to send in POST request
    let formData: any = new FormData();

    // Add and validate batchSize value from FormGroup
    // let batchSize = this.toolkitForm.get('batchSize').value;
    // if(batchSize < 1) { batchSize = 10; }
    // formData.set('batchSize', batchSize);

    // Add prepend-token boolean value from FormGroup
    formData.set('prependToken', this.toolkitForm.get('prependToken').value)

    // TODO: have this set to True automatically and show on interface if the model is of type gpt2

    // Add model and sentences values from FormGroup
    formData.set('model', this.toolkitForm.get('model').value);
    formData.set('sentences', this.toolkitForm.get('sentences').value);
    
    // Check for null file before adding file and filename (from template variables)
    if(this.DEBUG){ console.log("--> add file if this.file !== null?", this.file !== null); }
    if (this.file !== null) {
      formData.set('file', this.file);
      formData.set('filename', this.filename);
      
      // NOTE: this part might not be needed ~
      this.toolkitForm.patchValue({
        file: null,
        filename: ""
      });
      this.toolkitForm.get('file').updateValueAndValidity();
      this.toolkitForm.get('filename').updateValueAndValidity();
      // ~ end this part
    }

    // Testing to log formData
    if(this.DEBUG) {
      if(formData) {
        let dict = {}
        for (const pair of formData.entries()) {
          dict[pair[0]] = pair[1]
        }
        if(this.DEBUG){ console.log("new FormData object readied for POST:\n", dict); }
      }
    }
    
    // Only send POST request if model is selected, sentences from form have been added to formData, and submit button pressed
    if (formData.get('model') !== "" && ((formData.get('sentences') !== "" || formData.has('file'))) && this.submitConfirmed) {
      this.postFormData(formData); 
    }

  }

  /* Shorten error message for user alert */
  shortenError(message: string) {
    return message.split(": ")[1].toLocaleLowerCase()
  }
   
  /* Send formData as POST request, retrieve and store response */
  postFormData(formData: any) {
    if(this.DEBUG) { console.log("--> has file for POST request: ", formData.has('file')); }

    // Update template variables (NOTE: needed for template?)
    this.model = formData.get('model');
    if (formData.has('sentences')) { this.sentences = formData.get('sentences'); }

    // Show progress to user
    let processingWhich = formData.has('file') ? formData.get('filename') : '"' + formData.get('sentences').slice(0,10) + ' [...]"';
    this.setProgressUpdate("Processing " + processingWhich);
    this.outputData = {}; // clears output preview in html
    
    // Send formData as POST request to backend main.py
    if(this.DEBUG){ console.log("Sending POST request."); }
    this.http
      .post("/receive", formData)
      .subscribe({
        // Retrieve computed response
        next: (response) => {
          if(this.DEBUG) { console.log("response:", response); }
          // Parse and store parsed output data
          this.outputData = this.parseOutputResponse(response);
          if(this.DEBUG) { console.log(this.outputData['results_preview']); }
        },
        error: (error) => {
          console.log("error:", error),
          alert("File processing unsuccessful. Check file extension (.txt or .conllu) or choose a smaller file size. (Error message: " + this.shortenError(error.message) + ")")
        },
        complete: () => this.resetForm()
      });
  }
}
