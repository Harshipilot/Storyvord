import uuid
from django.db import models
from django.conf import settings


class AITask(models.Model):
    TASK_TYPES = (
        ('summarize', 'Summarize'),
        ('enhance', 'Enhance'),
        ('tags', 'Tag Generation'),
        ('email', 'Email Generation'),
        ('translate', 'Translate'),
    )

    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    task_type = models.CharField(max_length=50, choices=TASK_TYPES)
    input_text = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    result = models.JSONField(null=True, blank=True)
    celery_id = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.task_type} - {self.id} - {self.status}"
