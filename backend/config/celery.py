import os
from celery import Celery
from dotenv import load_dotenv

# ✅ Load .env BEFORE anything else
load_dotenv()

# ✅ Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')

# ✅ Read config from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# ✅ Auto-discover tasks from all apps
app.autodiscover_tasks()

# =========================
# OPTIONAL (recommended)
# =========================

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request}')