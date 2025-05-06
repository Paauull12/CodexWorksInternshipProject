from rest_framework import serializers

from todo_app.models import Todo

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ('id', 'title', 'description', 'status', 'dependency', 'due_date')

    def validate(self, attrs):
        title = attrs.get('title')
        status = attrs.get('status')

        instance = getattr(self, 'instance', None)

        if status in ['notstarted', 'inprogress']:
            existing_tasks = Todo.objects.filter(
                title=title,
                user=self.context['request'].user,
                status__in=['notstarted', 'inprogress']
            )

            if instance:
                existing_tasks = existing_tasks.exclude(pk=instance.pk)

            if existing_tasks.exists():
                raise serializers.ValidationError({
                    'title': 'A task with this title already exists and is not completed.'
                })

        return attrs