import os

def rename_files_recursively(folder_path, prefix):
    counter = 1  # Initialize a counter to ensure unique filenames
    
    # Walk through the directory tree
    for root, dirs, files in os.walk(folder_path):
        for file_name in files:
            # Construct the full file path
            old_file_path = os.path.join(root, file_name)
            
            # Construct the new file name with a unique counter
            new_file_name = f"{prefix}_{counter}.jpg"
            new_file_path = os.path.join(root, new_file_name)
            
            # Rename the file
            os.rename(old_file_path, new_file_path)
            print(f'Renamed: {old_file_path} -> {new_file_path}')
            
            # Increment the counter
            counter += 1

# Define the folder path and prefix
folder_path = "training-images"
prefix = "tokyo"

# Call the function to rename files
rename_files_recursively(folder_path, prefix)