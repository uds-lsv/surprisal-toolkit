# Web-Surprisal-Toolkit Documentation

## Overview

The **Web-Surprisal-Toolkit** is a web application designed to compute the surprisal of sentences using language models. It provides both file and string input methods for evaluation.

## Backend Structure (`backend/`)

*Located in `backend/`.*

### Functions

1. **User File Management**

   - **`upload_file(f, path_to_file)`**
     - Uploads a file to the specified path.

   - **`count_files(dir)`**
     - Counts the number of files in a given directory.

   - **`allowed_file(filename)`**
     - Checks if a file is allowed based on its filename and extension.

2. **Local Model Management**

   - **`contains_folder_structure(folder_path)`**
     - Checks if the specified folder contains the required files for a model.

3. **User and Session Management**

   - **`initialize_user(session)`**
     - Initializes a user session with a unique ID.

   - **`make_user_folder(session, parent_path_to_user_folder=settings.USERS_PATH)`**
     - Creates necessary folders for the user session.

   - **`delete_old_users(users_folder, hours_threshold=settings.USER_STORAGE_HOURS)`**
     - Deletes user folders older than the specified threshold.

   - **`delete_session_files(base_folder, hours_threshold=settings.USER_STORAGE_HOURS)`**
     - Deletes session files older than the specified threshold.

   - **`clear_old_sessions()`**
     - Clears old user folders and session files.

4. **Evaluation Functions**

   - **`parse_sentences_into_list(sentences, split_char="
")`**
     - Parses input sentences into a list.

   - **`parse_results_tsv(results_dir, results)`**
     - Parses a TSV results file into a list of (token, surprisal) tuples.

   - **`create_results_preview_for_file(filename)`**
     - Creates a preview of results for the specified file.

   - **`clear_directory(d)`**
     - Deletes all files in the specified directory.

   - **`remove_user_file(filename)`**
     - Removes a file from the user's folder.

   - **`clear_results()`**
     - Clears the results directory and stored user output for the current session.

   - **`run_eval_command(eval_script, user_input, text_type="file")`**
     - Builds and runs the command for evaluating surprisal.

   - **`send_file_to_eval_lm(user_input)`**
     - Runs evaluation on file input using `eval_lm.py`.

   - **`send_to_eval_conllu(user_input)`**
     - Runs evaluation on `.conllu` file input using `eval_conllu.py`.

   - **`compute_surprisal(sent_list, user_input)`**
     - Computes surprisal on a list of sentences.

   - **`compute(sent_list, group_num=1)`**
     - Computes surprisal on a list of sentences, saving results to `results.tsv`.

   - **`group_compute(sent_list)`**
     - Splits sentences into groups and evaluates surprisal, zipping results if necessary.

   - **`send_to_eval_lm(user_input)`**
     - Processes and sends sentences to `eval_lm.py` for evaluation.

5. **Flask Routes**

   - **`index()`**
     - Initializes the user and clears old sessions on page load.

   - **`add_local_models()`**
     - Receives a path to local models, verifies their structure, and adds them.

   - **`receive()`**
     - Receives user input, processes it, and returns the evaluation results.

   - **`get_zipfile()`**
     - Serves the results zip file for download.

   - **`get_result(file="results.tsv")`**
     - Serves a specific results file for download.

   - **`hello()`**
     - A simple test route that returns "Hello!".

### Settings

- **Server Paths**
  - `server_app_path`, `backend_path`, `languagemodels_dir`, `python3_lm`, `device`

- **Model Paths**
  - `model_dirs`, `tokenizers`

- **Limits**
  - `MAX_CHARS`, `MAX_CONTENT_LENGTH`

- **Results Preview**
  - `NUM_TOKENS_IN_PREVIEW`, `NUM_SENTENCES_IN_PREVIEW`

- **Required Model Files**
  - `REQUIRED_MODEL_FILES`

- **File Upload Settings**
  - `ALLOWED_EXTENSIONS`

- **User Storage Settings**
  - `USER_STORAGE_HOURS`, `USERS_PATH`, `FLASK_SESSIONS_PATH`

## Frontend Structure (`src/`)

*Located in `src/`.*

### AppRoutingModule

- **Path:** `app-routing.module.ts`
- **Description:** Manages the routing for the Angular application.

### AppComponent

- **Path:** `app.component.ts`
- **Description:** The root component of the Angular application.

### PlotlyService

- **Path:** `plotly.service.ts`
- **Description:** Service for handling Plotly plots.

#### Methods:
- **formatTokenIndex(tokens: string[]):** Formats tokens for display.
- **plotLine(title: string, plotDiv: string, x: string[], y: number[], xaxis_title: string, yaxis_title: string):** Plots a line chart.
- **createMultiplePlots(indices: number[], outputData: any):** Creates multiple plots.
- **toggleStaticLabels(plotDiv, legendCurveNumber):** Toggles the visibility of static labels.

### ToolkitComponent

- **Path:** `toolkit.component.ts`
- **Description:** Handles the main toolkit functionalities including form handling and submission.

### PlotsComponent

- **Path:** `plots.component.ts`
- **Description:** Handles the display of plots based on the output data.

### OutputComponent

- **Path:** `output.component.ts`
- **Description:** Displays the output data processed from the backend.

### LocalModelComponent

- **Path:** `local-model.component.ts`
- **Description:** Handles the upload and management of local models.
