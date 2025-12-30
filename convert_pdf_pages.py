"""
Convert PDF pages to WebP images using PyMuPDF (fitz)
Requires: pip install PyMuPDF pillow
"""

import os
from pathlib import Path

try:
    import fitz  # PyMuPDF
    from PIL import Image
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'PyMuPDF', 'pillow'])
    import fitz
    from PIL import Image

# Configuration
PDF_PATH = "src/assets/pdf/Noblessa A Beautiful Life_2026.pdf"
OUTPUT_DIR = "src/assets/images/catalog"
ZOOM = 2.0  # Higher zoom = higher resolution (2.0 = 144 DPI approx)
QUALITY = 85

def convert_pdf_to_webp():
    """Convert PDF pages to WebP images"""
    
    # Create output directory if it doesn't exist
    output_path = Path(OUTPUT_DIR)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"Converting {PDF_PATH} to WebP images...")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Zoom: {ZOOM}x, Quality: {QUALITY}")
    print("-" * 50)
    
    try:
        # Open PDF
        print("Loading PDF...")
        pdf_document = fitz.open(PDF_PATH)
        total_pages = len(pdf_document)
        
        print(f"Found {total_pages} pages")
        print("-" * 50)
        
        # Convert each page
        for page_num in range(total_pages):
            page = pdf_document[page_num]
            
            # Create transformation matrix for higher resolution
            mat = fitz.Matrix(ZOOM, ZOOM)
            
            # Render page to image
            pix = page.get_pixmap(matrix=mat)
            
            # Convert to PIL Image
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            
            # Save as WebP
            output_file = output_path / f"page-{page_num + 1}.webp"
            img.save(output_file, 'WEBP', quality=QUALITY, method=6)
            
            print(f"✓ Saved page {page_num + 1}/{total_pages}: {output_file.name}")
        
        pdf_document.close()
        
        print("-" * 50)
        print(f"✓ Successfully converted {total_pages} pages!")
        print(f"Files saved to: {output_path.absolute()}")
        return True
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = convert_pdf_to_webp()
    
    if success:
        print("\n" + "=" * 50)
        print("Conversion complete!")
        print("=" * 50)
