import os
import tempfile
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import fitz  # PyMuPDF

app = Flask(__name__)
# Enable CORS for all routes (important for cross-origin frontend calls)
CORS(app)

def analyze_pdf(file_path):
    try:
        doc = fitz.open(file_path)
        total_pages = len(doc)
        color_pages = 0
        bw_pages = 0

        for page_num in range(total_pages):
            page = doc[page_num]
            pix = page.get_pixmap()
            is_color = False
            if pix.colorspace:
                n = pix.colorspace.n
                if n > 1:
                    samples = pix.samples
                    # Precise color detection: check rendered pixels
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
        return {
            "totalCount": total_pages,
            "colorCount": color_pages,
            "bwCount": bw_pages,
            "status": "success"
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save to temp file
    fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    try:
        with os.fdopen(fd, 'wb') as tmp:
            file.save(tmp)
        
        result = analyze_pdf(temp_path)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    # Cloud Run expects the application to listen on PORT environment variable
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
