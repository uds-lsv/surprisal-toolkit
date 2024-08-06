export class Model {
    
    name: string;
    available: boolean; // available for use in computating surprisal
    source: string; // source of the model ("self-trained", "Hugging Face")
    display: string; // if the display name differs

    constructor(name: string, available: boolean = false, source: string = "", display: string = "") {
        this.name = name;
        this.display = display;
        this.available = available;
        this.source = source;
    }
}
