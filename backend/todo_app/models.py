from django.db import models
from django.contrib.auth.models import User


class Todo(models.Model):
    STATUS_CHOICES = (
        ('notstarted', 'Not Started'),
        ('inprogress', 'In Progress'),
        ('done', 'Done'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todos')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='notstarted'
    )
    due_date = models.DateTimeField(null=True, blank=True)

    dependency = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dependent_tasks'
    )

    def __str__(self):
        return self.title