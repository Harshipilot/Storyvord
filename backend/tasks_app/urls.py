from django.urls import path
from .views import (
    CreateTaskView,
    TaskStatusView,
    TaskResultView,
    DeleteTaskView,
    RetryTaskView,
    ListTasksView,
    QueueStatusView   # ✅ ADD THIS
)

urlpatterns = [
    path('tasks/create/', CreateTaskView.as_view()),
    path('tasks/', ListTasksView.as_view()),

    path('tasks/<uuid:pk>/status/', TaskStatusView.as_view()),
    path('tasks/<uuid:pk>/result/', TaskResultView.as_view()),
    path('tasks/<uuid:pk>/', DeleteTaskView.as_view()),
    path('tasks/<uuid:pk>/retry/', RetryTaskView.as_view()),

    # 🔥 THIS IS THE FIX
    path('queue/status/', QueueStatusView.as_view()),
]