# SurprisalToolkit

Web-based user interface for working with the [languagemodels](https://repos.lsv.uni-saarland.de/b4/languagemodels/) toolkit.  

Angular 14.2.2 frontend, Python Flask 2.2.2 backend.

---
# How to use locally

## Part 1: Setting up.

**(1)** Create an empty project folder. Inside this folder, clone (*if contributing*) or download (*if using only*) the 2 repositories:

- **web-surprisal-toolkit dev** repository.
- **[languagemodels development](https://repos.lsv.uni-saarland.de/b4/languagemodels/-/tree/development)** repository.


**(2)** Inside the main folder, create and activate a virtual environment using either:

- **Python venv**

	- Create a new virtual environment: `python3 -m venv ./languagemodels-venv`
	- Activate the virtual environment: `source languagemodels-venv/bin/activate`
	- Upgrade pip: `pip install --upgrade pip`

- **Python miniconda**

	- Create a new virtual environment: `conda create --name languagemodels python=3.9`
	- Activate the virtual environment: `conda activate languagemodels`
	- Upgrade pip: `pip install --upgrade pip`


**(3)** Install the appropriate version of PyTorch: https://pytorch.org/get-started/locally/

**(4)** Install the languagemodels package & requirements: `pip install -e languagemodels`

**(5)** Install the requirements for web-surprisal-toolkit: `pip install -r web-surprisal-toolkit/requirements.txt`

**(6)** Install npm dependencies: `npm install .`


## Part 2: Running the web app. :balloon:

1. Activate the virtual environment, if not done so already: `source languagemodels-venv/bin/activate` or `conda activate languagemodels`.

2. From the command line, navigate to folder *web-surprisal-toolkit*.

3. Run `ng build --configuration production --build-optimizer`. 

    *(This creates the `dist/` folder in the Angular project directory, from which the Flask backend renders the built files.)*

	*This command only needs to be run once. If changes are made to `web-surprisal-toolkit/src/`, run again to update `dist/`.*

4. Run `python3 backend/main.py`.

5. In a broswer, navigate to `http://localhost:5000/`.

(Use Control+C to stop running the application.)


---

## Development server - *testing Angular only*

*Note: this will not connect to functionality in Python backend files.*

1. Navigate to parent folder.

2. Run `ng serve` for a dev server. 

3. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files in *src/*.

(Use Control+C to stop running the application.)
___



This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.2.
