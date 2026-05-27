from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    # Keep default fields, but allow extension later
    pass
