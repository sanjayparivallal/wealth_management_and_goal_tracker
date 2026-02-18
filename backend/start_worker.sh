#!/bin/bash
# Start Celery worker with Beat (for scheduling)
# Using -B (beat) arguments to run both in one process for simplicity on Render
celery -A celery_app worker --beat --loglevel=info
