import logging

from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import AITask
from .serializers import CreateTaskSerializer, TaskSerializer
from .tasks import process_ai_task

logger = logging.getLogger(__name__)


# =========================
# CREATE TASK
# =========================
class CreateTaskView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = CreateTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        task = AITask.objects.create(
            user=request.user,
            task_type=serializer.validated_data['task_type'],
            input_text=serializer.validated_data['input_text'],
            status='PENDING',
        )

        async_result = process_ai_task.delay(str(task.id))
        task.celery_id = async_result.id
        task.save()

        return Response({
            "task_id": str(task.id),
            "status": "PENDING"
        }, status=status.HTTP_201_CREATED)


# =========================
# LIST TASKS
# =========================
class ListTasksView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TaskSerializer

    def get_queryset(self):
        return AITask.objects.filter(user=self.request.user).order_by('-created_at')


# =========================
# TASK STATUS
# =========================
class TaskStatusView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        task = get_object_or_404(AITask, pk=pk, user=request.user)

        return Response({
            "task_id": str(task.id),
            "status": task.status
        })


# =========================
# TASK RESULT
# =========================
class TaskResultView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, pk):
        task = get_object_or_404(AITask, pk=pk, user=request.user)

        return Response({
            "status": task.status,
            "result": task.result if task.status == "COMPLETED" else None
        })


# =========================
# DELETE TASK
# =========================
class DeleteTaskView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, pk):
        task = get_object_or_404(AITask, pk=pk, user=request.user)
        task.delete()

        return Response(
            {"message": "Task deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )


# =========================
# RETRY TASK
# =========================
class RetryTaskView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        task = get_object_or_404(AITask, pk=pk, user=request.user)

        if task.status != "FAILED":
            return Response(
                {"detail": "Only failed tasks can be retried"},
                status=status.HTTP_400_BAD_REQUEST
            )

        task.status = "PENDING"
        task.result = None
        task.save()

        async_result = process_ai_task.delay(str(task.id))
        task.celery_id = async_result.id
        task.save()

        return Response({
            "task_id": str(task.id),
            "status": "RESTARTED"
        })


# =========================
# QUEUE STATUS (🔥 FIXED MISSING VIEW)
# =========================
class QueueStatusView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response({
            "position": 0,
            "active_tasks": AITask.objects.filter(status="PROCESSING").count(),
            "pending_count": AITask.objects.filter(status="PENDING").count(),
            "estimated_time": "1-2 min"
        })