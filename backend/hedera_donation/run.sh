#!/bin/bash

set -e
set -x

echo "Applying database migrations..."
python manage.py migrate

# Temporarily disable "exit on error" to handle custom exit codes
set +e

echo "Checking for admin user..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model
import sys

User = get_user_model()
if not User.objects.filter(username='admin').exists():
    print("Admin user does not exist. Creating...")
    sys.exit(1)
else:
    print("Admin user already exists.")
    sys.exit(0)
EOF

check_exit_code=$?

# Re-enable "exit on error"
set -e

if [ $check_exit_code -eq 1 ]; then
    echo "Creating default superuser..."
    export DJANGO_SUPERUSER_USERNAME=admin
    export DJANGO_SUPERUSER_EMAIL=admin@admin.com
    export DJANGO_SUPERUSER_PASSWORD=admin
    python manage.py createsuperuser --noinput
else
    echo "Skipping superuser creation as it already exists."
fi

echo "Starting the development server..."
python manage.py runserver 0.0.0.0:8000 --noreload
