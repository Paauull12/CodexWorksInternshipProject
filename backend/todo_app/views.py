from django.db.migrations import serializer
from django.shortcuts import render, get_object_or_404
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from todo_app.models import Todo
from todo_app.serializers.TodoSerializer import TodoSerializer
from todo_app.serializers.UserSerializer import UserSerializer


# Create your views here.

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUser(request):
    user = UserSerializer(request.user).data
    return Response({'user': user}, status=status.HTTP_200_OK)

class RegisterView(APIView):

    def post(self, request):

        serializer1 = UserSerializer(data=request.data)

        if serializer1.is_valid():

            user = serializer1.save()

            refresh = RefreshToken.for_user(user)

            return Response({
                'user': serializer1.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }, status.HTTP_201_CREATED)

        return Response(serializer1.errors, status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):

    def post(self, request):

        username = request.data.get('username', None)
        password = request.data.get('password', None)

        if not username or not password:
            return Response({'error': 'Missing username or password'}, status.HTTP_400_BAD_REQUEST)

        user = User.objects.get(username=username)

        if user is None or not user.check_password(password):
            return Response({'error': 'Incorrect username or password'}, status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)

        return Response({
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):

        try:
            refresh = request.data.get('refresh')
            token = RefreshToken(refresh)

            token.blacklist()

            return Response({'success': 'Successfully logged out'},status=status.HTTP_200_OK)

        except Exception as e:

            return Response({'error': str(e)}, status.HTTP_400_BAD_REQUEST)

class TodoIndexView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        todo_tasks = request.user.todos.all()

        tasks = TodoSerializer(todo_tasks, many=True)

        return Response({'todo': tasks.data}, status.HTTP_200_OK)

class TodoDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer1 = TodoSerializer(data=request.data, context={'request': request})

        if serializer1.is_valid():
            serializer1.save(user=request.user)

            return Response({'todo': serializer1.data}, status=status.HTTP_201_CREATED)

        return Response(serializer1.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk, user=request.user)
        serializer1 = TodoSerializer(todo, context={'request': request})
        return Response({'todo':serializer1.data}, status=status.HTTP_200_OK)

    def put(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk, user=request.user)

        if todo.status == 'done':
            return Response(
                {'error': 'Cannot update todos with status "done"'},
                status=status.HTTP_403_FORBIDDEN
            )

        update_data = {}
        for field, value in request.data.items():
            if value is not None:
                update_data[field] = value

        serializer = TodoSerializer(
            todo, 
            data=update_data, 
            partial=True, 
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response({'todo': serializer.data}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self, request, pk):
        todo = get_object_or_404(Todo, pk=pk, user=request.user)
        todo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TodoByTitleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, title):

        todo = get_object_or_404(
            Todo,
            title = title,
            user=request.user,
            status__in = ['notstarted', 'inprogress']
        )

        serializer1 = TodoSerializer(todo, context={'request': request})

        return Response({'todo': serializer1.data}, status=status.HTTP_200_OK)

    def put(self, request, title):
        todo = get_object_or_404(
            Todo,
            title=title,
            user=request.user,
            status__in=['notstarted', 'inprogress']
        )
        serializer1 = TodoSerializer(todo, data=request.data, context={'request': request})

        if serializer1.is_valid():
            serializer1.save()
            return Response({'todo': serializer1.data}, status=status.HTTP_200_OK)

        return Response(serializer1.errors, status=status.HTTP_400_BAD_REQUEST)


    def delete(self, request, title):
        todo = get_object_or_404(
            Todo,
            title=title,
            user=request.user,
            status__in=['notstarted', 'inprogress']
        )
        todo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


