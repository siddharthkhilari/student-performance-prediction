"""
PDF Report Generator Script
---------------------------
Uses Microsoft Edge headless rendering engine to convert project_report.html
into a high-quality, formatted PDF document.
"""

import os
import shutil
import subprocess

def generate_pdf():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(base_dir, "project_report.html")
    
    # Target PDF paths
    desktop_dir = r"C:\Users\Admin\OneDrive\Desktop"
    pdf_desktop = os.path.join(desktop_dir, "Student_Performance_Prediction_Report.pdf")
    pdf_project = os.path.join(base_dir, "Student_Performance_Prediction_Report.pdf")
    
    edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_exe):
        edge_exe = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
        
    if not os.path.exists(edge_exe):
        raise FileNotFoundError("Microsoft Edge executable not found.")

    cmd = [
        edge_exe,
        "--headless",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={pdf_desktop}",
        html_path
    ]
    
    print(f"Converting HTML to PDF via Edge Headless...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if os.path.exists(pdf_desktop) and os.path.getsize(pdf_desktop) > 0:
        shutil.copy2(pdf_desktop, pdf_project)
        size_kb = os.path.getsize(pdf_desktop) / 1024
        print(f"SUCCESS! PDF created at:\n1. {pdf_desktop}\n2. {pdf_project}")
        print(f"File size: {size_kb:.2f} KB")
        return pdf_desktop
    else:
        print(f"Failed to generate PDF. Stderr: {result.stderr}")
        return None

if __name__ == "__main__":
    generate_pdf()
