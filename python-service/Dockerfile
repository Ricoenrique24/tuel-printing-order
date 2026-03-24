FROM python:3.11-slim

# Optimize for Cloud Run: keep image small and startup fast
WORKDIR /app

# Install runtime dependencies if needed
# PyMuPDF is self-contained in its wheel file

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy microservice code
COPY . .

# Run with Gunicorn using threads for better concurrency on Cloud Run
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
