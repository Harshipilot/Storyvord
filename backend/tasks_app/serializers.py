from rest_framework import serializers
from .models import AITask


class CreateTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = AITask
        fields = ('id', 'task_type', 'input_text')


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = AITask
        fields = ('id', 'task_type', 'input_text', 'status', 'result', 'created_at', 'updated_at')
