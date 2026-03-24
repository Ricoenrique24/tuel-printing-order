import fitz  # PyMuPDF
import sys
import json
import os

def analyze_pdf(file_path):
    try:
        doc = fitz.open(file_path)
        total_pages = len(doc)
        color_pages = 0
        bw_pages = 0

        for page_num in range(total_pages):
            page = doc[page_num]
            # Precise color detection: check rendered pixels
            pix = page.get_pixmap()
            is_color = False
            if pix.colorspace:
                n = pix.colorspace.n
                if n > 1:
                    samples = pix.samples
                    # Check every 10th pixel for performance, or all for maximum precision
                    # For a printing app, we want maximum precision
                    for i in range(0, len(samples), n):
                        if n == 3: # RGB
                            if samples[i] != samples[i+1] or samples[i+1] != samples[i+2]:
                                is_color = True
                                break
                        elif n == 4: # CMYK
                            if samples[i] != 0 or samples[i+1] != 0 or samples[i+2] != 0:
                                is_color = True
                                break
            
            if is_color:
                color_pages += 1
            else:
                bw_pages += 1
        
        doc.close()

        result = {
            "totalCount": total_pages,
            "colorCount": color_pages,
            "bwCount": bw_pages,
            "status": "success"
        }
        return result
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]
    if not os.path.exists(file_path):
        print(json.dumps({"status": "error", "message": f"File not found: {file_path}"}))
        sys.exit(1)

    analysis = analyze_pdf(file_path)
    print(json.dumps(analysis))
