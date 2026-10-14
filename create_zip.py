"""
Packaging Script
----------------
Creates a clean, portable zip archive of the project on the Desktop,
excluding node_modules, virtual environment, and cache directories.
"""

import os
import zipfile

def create_project_zip():
    base_dir = r"C:\Users\Admin\OneDrive\Desktop\student-performance-prediction"
    output_zip = r"C:\Users\Admin\OneDrive\Desktop\student-performance-prediction.zip"

    exclude_dirs = {
        "node_modules",
        "venv",
        ".venv",
        "__pycache__",
        ".pytest_cache",
        "dist",
        ".git"
    }

    print(f"Creating project archive at: {output_zip}")
    total_files = 0
    with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(base_dir):
            # Exclude unwanted directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file.endswith((".pyc", ".pyo", ".swp", ".DS_Store")):
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, base_dir)
                zipf.write(file_path, arcname=os.path.join("student-performance-prediction", rel_path))
                total_files += 1

    size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"Archive successfully created: {total_files} files packaged ({size_mb:.2f} MB).")

if __name__ == "__main__":
    create_project_zip()
