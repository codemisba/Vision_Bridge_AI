import os
from flask import Flask, render_template, request, jsonify
from werkzeug.utils import secure_filename

app = Flask(__name__)

# Configure where images are saved
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/process', methods=['POST'])
def process_images():
    if 'images' not in request.files:
        return jsonify({"error": "No images uploaded"}), 400
    
    language = request.form.get('language')
    files = request.files.getlist('images')
    
    results = []
    
    for file in files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # --- AI PROCESSING MOCKUP ---
            # This is where you would call an AI API like OpenAI or Google Vision
            # For now, we return a success message based on the language
            captions = {
                "en": f"Analysis complete for {filename}. Image shows a clear visual context.",
                "hi": f"{filename} के लिए विश्लेषण पूरा हुआ।",
                "kn": f"{filename} ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ.",
                "te": f"{filename} విశ్లేషణ పూర్తయింది."
            }
            
            description = captions.get(language, "Description generated successfully.")
            results.append({"filename": filename, "description": description})

    return jsonify({
        "status": "success",
        "language_selected": language,
        "data": results
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)