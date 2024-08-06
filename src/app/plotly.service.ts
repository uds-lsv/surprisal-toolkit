import { Injectable } from '@angular/core';
declare let Plotly: any;

@Injectable({
  providedIn: 'root'
})
export class PlotlyService {
  constructor() { }

  formatTokenIndex(tokens: string[]) {
    return tokens.map((s) => s.split("_")[0]+"<sup>"+s.split("_")[1]+"</sup>");
  }

  plotLine(title: string, plotDiv: string, x:string[], y:number[], xaxis_title: string, yaxis_title: string) {           
    let trace = {
      x: this.formatTokenIndex(x),
      y: y,   
      type: 'scatter'   
    };
                  
    let layout = {
      title: title,
      font: {
        size: 10
      } ,
      xaxis: {
        title: {
          text: xaxis_title
        },
      tickangle: -45
      },
      yaxis: {
        title: {
          text: yaxis_title
        }
      },
      margin: {
        l: 50,
        r: 15,
        b: 100,
        t: 100,
        pad: 4
      },
    };
    
    Plotly.newPlot(plotDiv, [trace], layout);     
  }

  
  createMultiplePlots(indices: number[], outputData: any): void {
    const plotArea: any = document.getElementById('plots-figure');
    plotArea.innerHTML = '';  // Clear the plot area

    let traces = [];
    const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']; // Example colors

    indices.forEach((index, idx) => {
      const data = outputData['results_preview'][index];
      if (!data) {
        console.error(`No data available for index ${index}.`);
        return;
      }

      // Interactive trace for hover
      const interactiveTrace = {
        x: data.map((_, i) => i + 1),
        y: data.map(item => parseFloat(item[1])),
        mode: 'lines+markers',
        type: 'scatter',
        name: `Sentence ${index + 1}`,
        text: data.map(item => item[0]),
        hoverinfo: 'text+y',
        line: { color: colors[idx % colors.length], width: 2 }
      };

      // Static label trace, initially invisible
      const staticLabelTrace = {
        x: data.map((_, i) => i + 1),
        y: data.map(item => parseFloat(item[1])),
        mode: 'text',
        type: 'scatter',
        text: data.map(item => item[0]),
        hoverinfo: 'none',
        showlegend: false,
        textposition: 'top center',
        textfont: {
          size: 12,
          color: colors[idx % colors.length],
          weight: 'bold'
        },
        visible: 'legendonly' // Make this trace only visible via legend click
      };

      traces.push(interactiveTrace);
      traces.push(staticLabelTrace); // Each interactive trace has a corresponding static label trace
    });

    const layout = {
      title: 'Combined Graph of Sentences',
      xaxis: { title: 'Token Number' },
      yaxis: { title: 'Score' },
      hovermode: 'closest',
      legend: { title: { text: 'Sentences' } }
    };

    Plotly.newPlot(plotArea, traces, layout);

    plotArea.on('plotly_legendclick', (data) => {
      this.toggleStaticLabels(plotArea, data.curveNumber);
      return false; // Prevents default behavior of hiding the traces
      
    });
  }


toggleStaticLabels(plotDiv, legendCurveNumber) {
  // Each legend click corresponds directly to the curve number that is just twice the legend index
  // because there is one interactive trace and one static label trace for each sentence.
  const staticLabelTraceIndex = legendCurveNumber + 1; // Static label trace immediately follows the interactive trace

  console.log("Legend click curveNumber:", legendCurveNumber, "Mapped staticLabelIndex:", staticLabelTraceIndex);

  // Check to ensure the trace index is valid
  if (staticLabelTraceIndex >= plotDiv.data.length) {
      console.error("No static label trace available for curve number:", legendCurveNumber);
      return; // Prevent further execution if no corresponding static label trace is found
  }

  const visibility = plotDiv.data[staticLabelTraceIndex].visible; // Access the visibility of the static label trace

  // Toggle visibility of static labels for the selected trace
  Plotly.restyle(plotDiv, {
      'visible': visibility === 'legendonly' ? true : 'legendonly'
  }, [staticLabelTraceIndex]); // Adjust only the static label trace
}




  
}
