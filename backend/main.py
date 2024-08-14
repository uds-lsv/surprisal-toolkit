# Load packages
from flask import Flask, render_template, jsonify, request, send_file, session, url_for
from flask_session import Session
from werkzeug.utils import secure_filename
import subprocess
import json
import os
import shutil
import pandas as pd
import csv
import conllu
import settings
from functions import clear_old_sessions, upload_file, count_files, allowed_file, contains_folder_structure, make_user_folder, initialize_user

# Initialize flask
app = Flask(__name__, static_url_path="", static_folder="../dist/surprisal-toolkit/", template_folder="../dist/surprisal-toolkit")
app.debug = True
app.config['MAX_CONTENT_LENGTH'] = settings.MAX_CONTENT_LENGTH

# Configure app for sessions
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False  # If set to True, the session will persist across browser sessions
app.config["SESSION_FILE_DIR"] = settings.FLASK_SESSIONS_PATH
Session(app)

# Store user input
user_input = {"model": "",
            #   "batch_size": 0,
              "prepend_token": False,
              "sentences": "",
              "file_name": "",
              "eval_type": "eval_lm",
              "local_model_counter": 0,

              # Results output
              "json_sentences": "",
              "output_file_name": "",
              "output_file_counter": 0,
              "num_files": 0, 
              "num_sentences_results": 0,
              "results_preview": []} 


### Functions ###
def parse_sentences_into_list(sentences, split_char="\n"):
    """
    Initial parsing
    """
    sent_list = list(filter(None, sentences.split(split_char))) # split sentences and remove empty strings
    return sent_list


def parse_results_tsv(results_dir, results):
    """
    Returns a list of (token, surprisal) tuples per sentence: 
    [[(tok,sur),(tok,sur),...],...]
    """
    results_per_sentence = {}
    
    with open(os.path.join(results_dir, results), "r", encoding="utf-8") as f:
        results_tsv = csv.reader(f, delimiter="\t")
        next(results_tsv) # skip header
        current_sent_id = -1
        for line in results_tsv:
            if len(line) >= 3:
                sentence_id = int(line[0])
                token = line[1]
                surprisal = line[2]
                if sentence_id != current_sent_id:
                    results_per_sentence[sentence_id] = []
                    current_sent_id = sentence_id
                results_per_sentence[sentence_id].append((token, surprisal)) # add (tok, surp) to sentence list
            else:
                print("LINE:", str(line)[:100]) #debugging

    sentence_ids = list(results_per_sentence.keys())
    sentence_ids.sort()

    user_input["num_sentences_results"] = len(sentence_ids)

    results_as_list = [results_per_sentence[i] for i in sentence_ids]

    return results_as_list



def create_results_preview_for_file(filename):
    """
    Build a preview of results. (To match the object currently being sent to / used in the frontend.)
    Return:
    - a list of listed (token, surprisal) scores per sentence 
      for up to settings.NUM_TOKENS_IN_PREVIEW total tokens (.conllu result files), 
      or settings.NUM_SENTENCES_IN_PREVIEW total sentences (.tsv result files)
    - the list of sentences
    """

    # intitialize data structure
    results_preview = []
    sentences = []
    path = os.path.join(session["results_dir"], filename)

    # parse existing results file
    if filename.endswith(settings.CONLLU_EXTENSION):
        
        count_tokens = 0
        count_sentences = 0
        
        open_f = open(path, "r", encoding="utf-8")

        for sentence in conllu.parse_incr(open_f):
            
            if count_tokens < settings.NUM_TOKENS_IN_PREVIEW:

                sentences.append(sentence.metadata["text"])
                token_surprisals = []
                for token in sentence:
                    token_surprisals.append((token["form"], token["misc"]["srp"]))
                    count_tokens += 1
                    
                    if count_tokens >= settings.NUM_TOKENS_IN_PREVIEW:
                        break
                
                results_preview.append(token_surprisals)
            
            count_sentences += 1

        open_f.close()
        user_input["num_sentences_results"] = count_sentences
    
    else:
        # Parse token-surprisal results from results.tsv for frontend viewing
        results_preview = parse_results_tsv(session["results_dir"], filename)[:settings.NUM_SENTENCES_IN_PREVIEW] # trim to max sentences

        # Parse sentences from tsv files for frontend viewing
        input_file_path = os.path.join(session["uploads_dir"], user_input["file_name"])
        with open(input_file_path, "r", encoding="utf-8") as f:
            content = f.read()
        sentences = parse_sentences_into_list(content)
        user_input["num_sentences_results"] = len(sentences)

    return results_preview, sentences



def clear_directory(d):
    """
    Remove all files in a given results directory.
    """
    if os.path.exists(d) and "results" in d:
        for f in os.listdir(d):
            filename = os.path.join(d, f)
            if os.path.isdir(filename):
                clear_directory(filename)
            else:
                print("deleting:", filename)
                os.remove(filename)

def remove_user_file(filename):
    """
    Remove the given file from the present session user folder.
    """
    f = os.path.join(session["user_dir"], filename)
    if os.path.isfile(f):
        os.remove(f)

def clear_results():
    """
    For the present user session, clear the results directory and stored user output.
    """
    # Clear results directory for new output
    print("\nClearing results folder:")
    clear_directory(session["results_dir"])
    remove_user_file("results.zip")

    # Clear stored output
    user_input["json_sentences"] = ""
    user_input["output_file_name"] = ""
    user_input["num_files"] = 0
    user_input["num_sentences_results"] = 0
    user_input["results_preview"] = [] 



def run_eval_command(eval_script, user_input, text_type="file"):
    """
    Build and run the command to send user_input data to languagemodels 
    eval_script ["eval_lm.py" or "eval_conllu.py"]. Specify text_type ["string", "file"].
    """
    assert eval_script in ["eval_lm.py", "eval_conllu.py"]
    assert text_type in ["string", "file"]

    # Build command to evaluate surprisal
    eval_command = [settings.python3_lm, os.path.join(settings.languagemodels_dir, eval_script),
                # "--batch_size", str(user_input["batch_size"]), 
                "--prepend_token", user_input["prepend_token"],
                "--output_dir", session["results_dir"],
                "--output_file_name", user_input["output_file_name"],
                "--device", settings.device]
    
    if text_type == "string":
        eval_command.extend(
                ["--eval_string", user_input["json_sentences"]])
    else: # file
        eval_command.extend(
                ["--input_files_path", session["uploads_dir"],
                 "--eval_file_name", user_input["file_name"]])

    # Adjust command for locally stored models
    model = user_input["model"]
    if model in settings.model_dirs.keys():
        model_name_or_path = settings.model_dirs[model]
        tokenizer = settings.tokenizers[model]
    else:
        # Adjust for huggingface models
        model_name_or_path = model
        tokenizer = model

    eval_command.extend(["--model_name_or_path", model_name_or_path,
                         "--tokenizer_name_or_path", tokenizer])
    
    # Run command line script
    subprocess.run(eval_command) 


def send_file_to_eval_lm(user_input):
    """
    Run eval_lm on file input.
    """
    user_input["num_files"] = 1
    user_input["output_file_name"] = "results.tsv"
    run_eval_command("eval_lm.py", user_input)


def send_to_eval_conllu(user_input):
    """
    Run eval_conllu on file input.
    """
    user_input["num_files"] = 1
    user_input["output_file_name"] = user_input["file_name"]
    user_input["eval_type"] = "eval_conllu"
    run_eval_command("eval_conllu.py", user_input)


def compute_surprisal(sent_list, user_input):
    """
    Run eval_lm on textbox list of sentences.
    """
    # Create json string of sentences
    json_string = '{"text": ' + json.dumps(sent_list) + '}'
    user_input["json_sentences"] = json_string
    run_eval_command("eval_lm.py", user_input, text_type="string")

    
def compute(sent_list, group_num=1):
    """
    Compute surprisal on a list of string sentences using eval_lm.
    Saves results as results.tsv to ./backend/user/results/.
    Reads file and returns a list of result (token, surprisal_value) tuples. #TODO might not be needed
    """

    filename = ("results_" + str(group_num) if group_num > 1 else "results") + ".tsv"
    user_input["output_file_name"] = filename

    # Compute surprisal on sentences
    compute_surprisal(sent_list, user_input)

    return filename


def group_compute(sent_list):
    """
    Split the sentence list into groups of sentences, where each group's character count is < MAX_CHARS.
    Evaluate surprisal on each group. Zip results.

    --> Note: only needed for string textbox input (not file input)
    """
    total_chars = 0
    grouped_indices = [] # where each index maps to a sentence in sent_list
    last_sentence_index = 0

    # Divide the sentences into groups (tuples of (start_index, end_index)) 
    # where total character count in each group < MAX_CHARS
    for i in range(len(sent_list)):
        chars = len(sent_list[i])
        total_chars += chars
        if total_chars > settings.MAX_CHARS:
            group = (last_sentence_index, i) # store start and end indices of sentences up to last one
            last_sentence_index = i # add the last sentence to the next batch
            total_chars = 0 # reset total chars
            grouped_indices.append(group)
        elif i == len(sent_list)-1:
            group = (last_sentence_index, i+1) # enable the last sentence to be indexed from sent_list later
            grouped_indices.append(group)

    # Compute surprisal for each group: iterate through grouped_indices (a list of tuples)
    group_files = []
    group_number = 1 # for groups > 1, name each result with a counter (results_#.tsv)
    #print("\ngrouped_indices[0:30]:", grouped_indices[0:30])
    for group in grouped_indices:
        print(f"computing next group ({group_number} out of {len(grouped_indices)}) in indices: {group}")
        start, end = group # group is a tuple (start, end)
        group_files.append(compute(sent_list[start : end], group_num=group_number))
        group_number += 1

    result_tuples = parse_results_tsv(session["results_dir"], "results.tsv")
    
    # Zip the final results: rename each file by counter and zip these results)
    num_result_files = count_files(session["results_dir"]) # find number of result group files
    print("\nnum_result_files:", num_result_files)
    user_input["num_files"] = num_result_files
    user_input["output_file_name"] = "results.zip" if num_result_files > 1 else "results.tsv"

    # Create zip_file
    if num_result_files > 1:
        shutil.make_archive(session["results_dir"], 'zip', session["results_dir"])

    # for testing
    print("len(group_files):", len(group_files))
    return result_tuples # returns the first compute() value


def send_to_eval_lm(user_input):
    """
    Process textbox sentences to send to eval_lm, in several calls if total characters are too long.
    """
    # user_input["results_preview"] = compute_surprisal(user_input["sentences"], user_input)
    user_input["results_preview"] = group_compute(user_input["sentences"])



### Routes ###
@app.route("/")
def index():
    """
    When page loads:
    """
    initialize_user(session)
    clear_old_sessions()
    return render_template("index.html")


@app.route("/upload-models", methods=['POST'])
def add_local_models():
    """
    Receives absolute path to local model(s) folder.
    - Checks whether path contains model folders or is a model folder
    - Checks for required folder structure
    Returns a JSON object of model_folder name(s) and absolute path(s).

    # TODO: add error messages to send to frontend and a way to clear local models?
    """
    default_model_name = "local pre-trained model"

    print("Local model path received:", request.form)
    folder_path = request.form.getlist("modelFolderPath")[0]
    local_models = {}

    if os.path.isdir(folder_path):

        # look for local models
        one_model = contains_folder_structure(folder_path)

        if one_model:
            # assign model name
            if default_model_name in settings.model_dirs.keys():
                default_model_name = default_model_name + " " + str(user_input["local_model_counter"])

            # add to model dirs
            settings.model_dirs[default_model_name] = folder_path
            settings.tokenizers[default_model_name] = folder_path
            local_models[default_model_name] = folder_path
            user_input["local_model_counter"] += 1

        else:
            # check for multiple model folders
            for filename in os.listdir(folder_path):
                f = os.path.join(folder_path, filename)
                # only add proper model folders from main folder into model dirs
                if os.path.isdir(f) and contains_folder_structure(f):
                    settings.model_dirs[filename] = f
                    settings.tokenizers[filename] = f
                    local_models[filename] = f
                    user_input["local_model_counter"] += 1

        print("model_dirs:", settings.model_dirs)
        return jsonify(local_models)
    
    else:
        print("Error: the given path must be a directory.")
        return ""


@app.route("/receive", methods=['POST'])
def receive():
    """
    Receives the POST request object from frontend.
    - Parses request object into user_input dict.
    - Computes surprisal on the given input and adds this to user_input.
    Returns the resulting user_input as a JSON response.
    """
    # Create or confirm existing user folder upon receiving input
    make_user_folder(session)
    
    # Clear existing results output
    clear_results()

    print(f"user id: {session['user_id']}")
    print("POST request received!:", request.form, request.files)
    
    user_input["model"] = request.form.getlist("model")[0]
    # user_input["batch_size"] = int(request.form.getlist("batchSize")[0])
    user_input["prepend_token"] = "True" if request.form.getlist("prependToken")[0] == "true" else "False"

    # Store input if any
    textbox_sentences = request.form.getlist("sentences")[0]
     
    # Check for file
    if 'file' in request.files:
        file_to_read = request.files["file"]
        filename = secure_filename(file_to_read.filename)
        
        if allowed_file(filename):
            user_input["file_name"] = filename

            # Upload file to user folder
            upload_file(file_to_read, os.path.join(session["uploads_dir"], user_input["file_name"]))
        
            # Send .conllu files to eval_conllu.py
            if user_input["file_name"].lower().endswith(settings.CONLLU_EXTENSION):
                send_to_eval_conllu(user_input)
                user_input["results_preview"], user_input["sentences"] = create_results_preview_for_file(filename)
                
            # Send text files to eval_lm.py
            else:
                print(f"file_to_read: {file_to_read}")
                send_file_to_eval_lm(user_input)
                user_input["results_preview"], user_input["sentences"] = create_results_preview_for_file("results.tsv")

        # todo: make it clear to the user if a file isn't allowed and why (see toolkit.component.ts)
        else:
            return(Exception)

    # Check for sentences in textbox
    elif textbox_sentences:
        user_input["sentences"] = parse_sentences_into_list(textbox_sentences, "\r\n")
        send_to_eval_lm(user_input)

    else:
        user_input["file_name"] = ""
        user_input["sentences"] = "no file or entered text"
    
    # NOTE: consider not sending the parsed sentences back (extra load time) unless they are used
    return jsonify(user_input)


@app.route("/user/results.zip")
def get_zipfile():
    results_zip_path = os.path.join("users", session["user_id"], "results.zip")
    try:
        return send_file(results_zip_path, download_name='results.zip')
    except Exception as e:
        return str(e)


@app.route("/user/<file>")
def get_result(file="results.tsv"):
    result_path = os.path.join("users", session["user_id"], "results", file)
    try:
        return send_file(result_path, download_name=file)
    except Exception as e:
        return str(e)


@app.route("/hello")
def hello():
    return "Hello!"


# Run
if __name__=="__main__":
    app.run(host="0.0.0.0", port=5000)