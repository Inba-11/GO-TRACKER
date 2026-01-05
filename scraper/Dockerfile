FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for Selenium and Chrome
RUN apt-get update && apt-get install -y \
    chromium-browser \
    chromium-driver \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Run scheduler
CMD ["python", "production_scheduler.py"]
