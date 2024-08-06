import { Directive, ElementRef, Renderer2, Input, HostListener } from '@angular/core';

// Attaches the html element labeled appHrefData to this directive
@Directive({
  selector: '[appHrefData]'
})
export class HrefDataDirective {

  // Pass outputData from component to directive with [outputData] in html tag
  @Input() outputData: Object;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  // Listen for a click event on the appHrefData element
  @HostListener('click') onClick() {
    console.log("directive onClick()")
    this.setHrefData();
  }
  
  // Set href attribute data for the file download element (this builds the contents of the csv file)
  private setHrefData() {
    console.log("setHrefData()")
    let hrefData = 'data:text/csv;charset=utf-8,'
    hrefData += this.outputData['results_preview'] ? encodeURIComponent(this.buildOutputString()) : encodeURIComponent("no output data");
    // hrefData += encodeURIComponent(this.buildOutputString()) // NOTE: uncomment above after testing file contents
    
    this.renderer.setAttribute(this.el.nativeElement, 'href', hrefData);
  }

  // Build output string into CSV file format
  private buildOutputString() {
    // --> TODO: ignore data tags? (probably will in main.py)

    let outputString = "token/word, surprisal, sentence_id\n";
    let sentence_id = 0;

    for(let sentence of this.outputData['results_preview']) {
      sentence_id += 1;
      for(let word_score of sentence) {
        outputString += this.formatCommas(word_score[0]) + "," + word_score[1] + "," + sentence_id + "\n";
      }
    }

    console.log(this.outputData)
    console.log(outputString)
    return outputString;
  }

  // Format text with commas into "" quotes
  formatCommas(text: string) {
    if(text.includes(",")) {
      text = '"' + text + '"';
    }
    return text;
  }


}
