"""
Settings for Suprisal Toolkit app run in main.py
"""
import os

# Set paths for web server, or
server_app_path = os.path.join("/var/www/html/web_prototype/")
if os.path.exists(server_app_path):
    backend_path = os.path.join(server_app_path, "surprisal_toolkit/backend")
    languagemodels_dir = os.path.join(server_app_path, "languagemodels")
    python3_lm = str(os.path.join("/usr/local/envs/lm-toolkit-3.9/bin/")) + "python3"
    device = "cuda"

# Set paths for development
else:
    backend_path = os.path.join(os.path.abspath(os.getcwd()), "backend")
    languagemodels_dir = os.path.join(".", "..", "languagemodels")
    python3_lm = "python3"
    device = "cpu"

# Model paths and tokenizer paths
model_dirs = {"wikitext model": os.path.join(languagemodels_dir, "trained_models/wikitext-103")}
tokenizers = {"wikitext model": os.path.join(languagemodels_dir, "tokenizers/wikitext-103/bpe_10000")}

# Maximum number of characters to pass in as a string arg to eval_lm
MAX_CHARS = 10000 

# Maximum allowed size of uploaded files
MAX_CONTENT_LENGTH = 500 * 1000 * 1000 # 500 MB

# Evaluation default values
BATCH_SIZE_DEFAULT = 10

# Results preview
NUM_TOKENS_IN_PREVIEW = 50000
NUM_SENTENCES_IN_PREVIEW = 5000

# Local pretrained model required files
REQUIRED_MODEL_FILES = ["config.json", "pytorch_model.bin", "tokenizer.json"]

# Additional constants
CONLLU_EXTENSION = ".conllu"

# File uploads allowed
ALLOWED_EXTENSIONS = {"conllu", "txt"} # based on languagemodels parsing

# Amount of time a user folder is kept on the server
USER_STORAGE_HOURS = 24

USERS_PATH = os.path.join(backend_path, "users")
FLASK_SESSIONS_PATH = os.path.join(backend_path, "flask_session")
