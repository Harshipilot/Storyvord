from celery import shared_task
from celery.utils.log import get_task_logger
from django.db import transaction
from .models import AITask
from .services import process_task

logger = get_task_logger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def process_ai_task(self, task_id):
    try:
        task = AITask.objects.get(pk=task_id)
    except AITask.DoesNotExist:
        logger.error(f"Task not found: {task_id}")
        return

    try:
        task.status = 'PROCESSING'
        task.save()

        result = process_task(task)

        # Preserve structured result data from the AI feature modules.
        if isinstance(result, dict):
            task.result = result
        else:
            task.result = {'output': str(result)}

        task.status = 'COMPLETED'
        task.save()

        return task.result

    except Exception as exc:
        logger.exception('Processing failed')

        task.status = 'FAILED'
        task.result = str(exc)
        task.save()

        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error('Max retries exceeded for task %s', task_id)
            return task.result