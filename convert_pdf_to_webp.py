"""
Convert PDF pages to WebP images for the flipbook carousel
Requires: pip install pdf2image pillow
Also requires poppler: Download from https://github.com/oschwartz10612/poppler-windows/releases/
"""

import os
from pathlib import Path

try:
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError:
    print("Installing required packages...")
    import subprocess
    subprocess.check_call(['pip', 'install', 'pdf2image', 'pillow'])
    from pdf2image import convert_from_path
    from PIL import Image

# Configuration
PDF_PATH = "public/assets/pdf/catalogs2026/Noblessa A Beautiful Life_2026.pdf"
OUTPUT_DIR = "public/assets/images/catalog"
DPI = 150
QUALITY = 85

def convert_pdf_to_webp():
    """Convert PDF pages to WebP images"""
    
    # Create output directory if it doesn't exist
    output_path = Path(OUTPUT_DIR)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"Converting {PDF_PATH} to WebP images...")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"DPI: {DPI}, Quality: {QUALITY}")
    print("-" * 50)
    
    try:
        # Convert PDF to images
        print("Loading PDF...")
        images = convert_from_path(PDF_PATH, dpi=DPI)
        
        total_pages = len(images)
        print(f"Found {total_pages} pages")
        print("-" * 50)
        
        # Save each page as WebP
        for i, image in enumerate(images, start=1):
            output_file = output_path / f"page-{i}.webp"
            
            # Convert to RGB if necessary (WebP doesn't support RGBA well in all browsers)
            if image.mode == 'RGBA':
                rgb_image = Image.new('RGB', image.size, (255, 255, 255))
                rgb_image.paste(image, mask=image.split()[3])
                image = rgb_image
            
            # Save as WebP
            image.save(output_file, 'WEBP', quality=QUALITY, method=6)
            
            print(f"✓ Saved page {i}/{total_pages}: {output_file.name}")
        
        print("-" * 50)
        print(f"✓ Successfully converted {total_pages} pages!")
        print(f"Files saved to: {output_path.absolute()}")
        
    except Exception as e:
        print(f"✗ Error: {str(e)}")
        print("\nNote: This script requires poppler-utils.")
        print("Download poppler for Windows from:")
        print("https://github.com/oschwartz10612/poppler-windows/releases/")
        print("Extract and add the 'bin' folder to your PATH.")
        return False
    
    return True

if __name__ == "__main__":
    success = convert_pdf_to_webp()
    
    if success:
        print("\n" + "=" * 50)
        print("Ready to use! The flipbook will now display these pages.")
        print("=" * 50)
    else:
        print("\nAlternative: Use an online PDF to image converter:")
        print("1. Go to https://cloudconvert.com/pdf-to-webp")
        print("2. Upload your PDF")
        print("3. Convert all pages to WebP")
        print("4. Rename files to: page-1.webp, page-2.webp, etc.")
        print(f"5. Place in: {OUTPUT_DIR}")
