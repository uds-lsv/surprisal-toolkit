# Surprisal Toolkit

The Surprisal Toolkit is a web-based user interface for computing surprisal measurements over text through the [languagemodels](https://github.com/uds-lsv/languagemodels) toolkit.

Developed using: [Angular 14.2.2]((https://github.com/angular/angular-cli)) frontend, Python Flask 2.2.2 backend.

**Contents**

- [How to set up locally](#how-to-use-locally)
- [Hosting](#hosting)
- [Paper & Teaching Materials](#paper-and-teaching-materials)
- [Function documentation](Web_Surprisal_Toolkit_Documentation.md)

---
## How to use locally

### Part 1: Setting up.

**(1)** Create an empty project folder. Inside this folder, clone (*if contributing*) or download (*if using only*) the **surprisal-toolkit** and [languagemodels](https://github.com/uds-lsv/languagemodels) repositories:

- `git clone https://github.com/uds-lsv/surprisal-toolkit.git`
- `git clone https://github.com/uds-lsv/languagemodels.git`

**(2)** Inside the main folder, create and activate a virtual environment using either:

- **Python venv**

	- Create a new virtual environment: `python3 -m venv ./languagemodels-venv`
	- Activate the virtual environment: `source languagemodels-venv/bin/activate`
	- Upgrade pip: `pip install --upgrade pip`

- **Python miniconda**

	- Create a new virtual environment: `conda create --name languagemodels python=3.9`
	- Activate the virtual environment: `conda activate languagemodels`
	- Upgrade pip: `pip install --upgrade pip`

With the virutal environment activated, install the requirements in the following steps.


**(3)** Install the appropriate version of PyTorch: https://pytorch.org/get-started/locally/

**(4)** Install the languagemodels package & requirements: `pip install -e languagemodels`

**(5)** Install the requirements for surprisal-toolkit: `pip install -r surprisal-toolkit/requirements.txt`

**(6)** Install npm dependencies: `npm install .`


### Part 2: Running the web app. :balloon:

1. Activate the virtual environment, if not done so already: `source languagemodels-venv/bin/activate` or `conda activate languagemodels`.

2. From the command line, navigate to folder *surprisal-toolkit*.

3. Run `ng build --configuration production --build-optimizer`. 

    *(This creates the `dist/` folder in the Angular project directory, from which the Flask backend renders the built files.)*

	*This command only needs to be run once. If changes are made to `surprisal-toolkit/src/`, run again to update `dist/`.*

4. Run `python3 backend/main.py`.

5. In a broswer, navigate to `http://localhost:5000/`.

(Use Control+C to stop running the application.)


### Angular development server - *how to test Angular frontend only*

*Note: this will not connect to functionality in Python back-end files.*

1. Navigate to parent folder.

2. Run `ng serve` for a dev server. 

3. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files in *src/*.

(Use Control+C to stop running the application.)
___

## Hosting

The application can also be hosted on a web server. We use Apache 2.4 and mod_wsgi 4.7.1. As a reference, files for configuring the Flask application are stored under `\server`. 

## Paper and Teaching Materials

This code is described in our paper, ["An Interactive Toolkit for Approachable NLP"](https://aclanthology.org/2024.teachingnlp-1.17.pdf) by AriaRay Brown, Julius Steuer, Marius Mosbach, and Dietrich Klakow, presented in the TeachNLP Workshop at ACL 2024.

The Surprisal Toolkit can be used as a resource for teaching information theory along with the calculation of surprisal from large language models. We share our [teaching materials](https://github.com/uds-lsv/surprisal-toolkit-teaching-materials) here for your interest.