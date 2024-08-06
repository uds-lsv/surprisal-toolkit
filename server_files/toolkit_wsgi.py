# create new

import sys
import os

# add paths for app to search for files in
sys.path.append("/var/www/html/")
sys.path.append("/var/www/html/web_prototype/surprisal_toolkit/backend/")
sys.path.append("/var/www/html/web_prototype/languagemodels/")

# add languagemodels python bin path
sys.path.append("/usr/local/envs/lm-toolkit-3.9/bin")

# pytorch cache
os.environ["HF_HOME"]="/var/www/html/web_prototype/pytorch_cache"  

from web_prototype.surprisal_toolkit.backend.main import app
application = app
