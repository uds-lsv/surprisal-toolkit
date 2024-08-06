"""
Functions for Suprisal Toolkit app run in main.py
"""

from datetime import datetime
import os
import re
import time
import shutil
import settings


### for user files ###
def upload_file(f, path_to_file):
    """
    Upload file f to path_to_file.
    """
    f.save(path_to_file)

def count_files(dir):
    """
    Count the number of files in a given directory.
    """
    count = 0
    for path in os.scandir(dir):
        if path.is_file():
            count += 1
    return count

def allowed_file(filename):
    """
    Check if file is allowed based on filename string.
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in settings.ALLOWED_EXTENSIONS


### for local model uploads ###
def contains_folder_structure(folder_path):
    """
    Returns True if the given folder contains the proper sub-folders and files
    required for a model folder. Else False.
    """
    required = settings.REQUIRED_MODEL_FILES
    
    for filename in required:
        required_file = os.path.join(folder_path, filename)
        if not os.path.exists(required_file):
            print(f"{required_file}\ndoes not exist in folder {folder_path}")
            return False
    
    return True


### for users and sessions ###
def initialize_user(session):
    # Initialize user in session
    user_id = re.sub(r"\D", "", str(datetime.now()))[:-6]
    session["user_id"] = "user_" + user_id
    print(f"session['user_id']: {session['user_id']}")
    print(f"session: {session}")

def make_user_folder(session, parent_path_to_user_folder = settings.USERS_PATH):

    # Name user folder paths
    user_folder = session["user_id"]
    user_folder_path = os.path.join(parent_path_to_user_folder, user_folder)
    results_path = os.path.join(user_folder_path, "results")
    uploads_path = os.path.join(user_folder_path, "uploads")
    
    # Make folders
    if not os.path.isdir(user_folder_path):
        os.mkdir(user_folder_path)
        os.mkdir(uploads_path)
        os.mkdir(results_path)

    # Store paths in session
    session["user_dir"] = user_folder_path
    session["uploads_dir"] = uploads_path
    session["results_dir"] = results_path


def delete_old_users(users_folder, hours_threshold = settings.USER_STORAGE_HOURS):
    """
    Delete user folders contained in users_folder that are older than hours_threshold.
    """
    current_time = time.time()

    for folder_name in os.listdir(users_folder):
        folder_path = os.path.join(users_folder, folder_name)

        # Check if the path is a directory
        if os.path.isdir(folder_path):
            # Get the folder's creation time
            creation_time = os.path.getctime(folder_path)

            # Calculate the age of the folder in hours
            age_in_hours = (current_time - creation_time) / 3600 # num seconds in an hour

            # Delete the folder if it's older than the specified threshold
            if age_in_hours > hours_threshold:
                shutil.rmtree(folder_path)
                print(f"Deleted folder: {folder_path}")


def delete_session_files(base_folder, hours_threshold = settings.USER_STORAGE_HOURS):
    """
    Delete session files contained in the sessions folder that are older than the hours threshold.
    """
    current_time = time.time()

    for f in os.listdir(base_folder):
        f_path = os.path.join(base_folder, f)

        creation_time = os.path.getctime(f_path)
        f_age_in_hours = (current_time - creation_time) / 3600 # num seconds in an hour

        # Delete the file if older than the specified threshold
        if f_age_in_hours > hours_threshold:
            os.remove(f_path)
            print(f"Deleted file: {f_path}")


def clear_old_sessions():
    """
    Delete old user folders and associated session files.
    """
    delete_old_users(settings.USERS_PATH)
    delete_session_files(settings.FLASK_SESSIONS_PATH)
