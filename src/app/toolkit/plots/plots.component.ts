import { Component, OnInit, Input, AfterViewInit, OnChanges, SimpleChanges, AfterViewChecked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PlotlyService } from '../../plotly.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-plots',
  templateUrl: './plots.component.html',
  styleUrls: ['./plots.component.css']
})
export class PlotsComponent implements OnInit, AfterViewInit, OnChanges, AfterViewChecked {

  // Template variables updated from parent toolkit
  @Input() model: string;
  @Input() outputData: Object;
  @Input() progress: string;


  selectedSentences: number[] = [0];

  private needsPlotting: boolean = false;

  // TESTING: replace `outputDataCopy` with actual `outputData` var in .ts and .html files when done
  outputDataCopy = {"sentences": ["once upon a time in a city filled with books", "", "the cat sat in a hat"],
                            "results_preview": [[['once', 0.2], ["upon", 0.3], ["a", 0.4], ["time", 0.1], ["in", 0.4], ["a", 0.1], ["city", 0.3], ["filled", 0.2], ["with", 0.3], ["books", 0.7]],
                                       [], [["the", 0.1], ["cat", 0.3], ["sat", 0.2], ["in", 0.3], ["a", 0.7], ["hat", 0.2]]]}; // for dev testing
  
  scorePlot: any = null;

  constructor(private http: HttpClient, private plot:PlotlyService, private router: Router) { }

  ngOnInit(): void { 
    // Log outputData to ensure it is properly passed
    console.log("ngOnInit - outputData:", this.outputData);

    // Subscribe to router events to detect tab changes
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Check if the current URL is the "Plots" tab
        if (event.url.includes('/plots')) {
          this.plotSelectedSentences();
        }
      }
    });
  }
  ngAfterViewInit(): void {
    // Log a message to indicate the view has been initialized
    console.log("ngAfterViewInit - View Initialized");
    // Ensure outputData is loaded before plotting
    if (this.outputData && this.outputData['sentences']) {
      this.plotSelectedSentences();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['outputData']) {
      console.log("ngOnChanges - outputData changed:", this.outputData);
      if (this.outputData && this.outputData['sentences']) {
        
        this.selectedSentences = [0];
        this.needsPlotting = true;
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this.needsPlotting && this.outputData && this.outputData['sentences']) {
      console.log("ngOnChanges - plotting selected sentences");
      this.plotSelectedSentences();
      this.needsPlotting = false;
    }
  }

  // Checks if object is empty (used in template to check for outputData)
  isEmpty(output: Object) {
    return Object.keys(output).length === 0;
  }

  truncateSentence(sentence: string, length: number): string {
    if (sentence.length <= length) return sentence;
    const start = sentence.slice(0, Math.floor(length / 2));
    const end = sentence.slice(sentence.length - Math.floor(length / 2));
    return `${start}...${end}`;
  }

  updateSelectedSentences(event: any): void {
    const sentenceID = Number(event.target.value);
    if (event.target.checked) {
      this.selectedSentences.push(sentenceID);
    } else {
      this.selectedSentences = this.selectedSentences.filter(id => id !== sentenceID);
    }
    // this.plotSelectedSentences(); // Automatically plot the selected sentences
    this.needsPlotting = true;
    console.log("update sentence called, sentences selected:", this.selectedSentences);
  
  }

  createPlot(sentenceID: number, output: Object) {
    console.log("Plotting..." + sentenceID)

    let sentence = output["sentences"][sentenceID];
    let title = "Sentence Surprisal: <br>" + sentence.slice(0,50) + "...";
    let results_preview = output["results_preview"][sentenceID]
    let xaxis_title = output["eval_type"] === "eval_conllu" ? "Word" : "Token";

    let x = []
    for (let token_i in results_preview) {
      x.push(results_preview[token_i][0] + "_" + token_i)
    }
    let y = results_preview.map(function (surprisal: any[]) {
              return surprisal[1];
            })

    this.plot.plotLine(title, "plots-figure", x, y, xaxis_title, "Suprisal Score (log<sub>2</sub>)");
    console.log("output data:", output) // debugging
  }

  parsePlotImage(response: any) {
    return JSON.parse(response)
  }

  // Plots the selected sentence from the output data using the sentence id
  plotSentence(sentenceID: any, output: Object) {
    // Note: can use token-surprisal data already stored in frontend (or backend?). Only need sentence index to index `results_preview`.
    sentenceID = Number(sentenceID);
    console.log("sentenceID:", sentenceID, ", sentence:", output["sentences"][sentenceID]);

    this.createPlot(sentenceID, output);
  }

 // Plots the selected sentences from the output data using the sentence ids
  plotSentences(selectedOptions: HTMLCollectionOf<HTMLOptionElement>, outputData: any) {
    console.log("CLICKED PLOT MULTIPLE");
    const indices = Array.from(selectedOptions).map(option => parseInt(option.value));
    console.log("Output data:", outputData)
    console.log("selected sentences:", indices);
    this.plot.createMultiplePlots(indices, outputData);
  }

  plotSelectedSentences(): void {
    console.log("plotting selected sentences:", this.selectedSentences);
    const plotDiv = document.getElementById('plots-figure');
    if (plotDiv) {
      this.plot.createMultiplePlots(this.selectedSentences, this.outputData);
    } else {
      console.error("plotSelectedSentences - 'plots-figure' element not found.");
    }
  }


}
