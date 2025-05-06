# Folosim Python 3.10 pentru compatibilitate cu Django 5.x
FROM python:3.10-slim

# Setăm directorul de lucru în container
WORKDIR /app

# Instalăm dependențele necesare pentru Postgres
RUN apt-get update && apt-get install -y \
    postgresql-client \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiem fișierul requirements
COPY requirements.txt .

# Upgrade pip și instalăm dependențele
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copiem codul sursă
COPY . .

# Expunem portul
EXPOSE 8000

# Comandă pentru pornire
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000