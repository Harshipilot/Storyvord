
from django.conf import settings
from .ai.groq_client import GroqClient
from .ai import summarizer, enhancer, tag_generator, email_generator, translator


CLIENT = GroqClient(api_key=getattr(settings, 'GROQ_API_KEY', None), model=getattr(settings, 'GROQ_MODEL', None))


def process_task(task_obj):
    """Orchestrate AI feature calls. Returns a JSON-serializable result."""
    mapping = {
        'summarize': summarizer.run,
        'enhance': enhancer.run,
        'tags': tag_generator.run,
        'email': email_generator.run,
        'translate': translator.run,
    }

    func = mapping.get(task_obj.task_type)
    if not func:
        raise ValueError('Unknown task type')

    return func(CLIENT, task_obj.input_text)
