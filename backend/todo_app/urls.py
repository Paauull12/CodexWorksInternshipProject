from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from todo_app.views import RegisterView, LoginView, LogoutView, TodoIndexView, TodoDetailView, TodoByTitleView, getUser

urlpatterns = [
    # User Auth Endpoints
    path('user/', getUser, name='get_user'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # To Do Endpoints
    path('todos/', TodoIndexView.as_view(), name='todo_list'),

    path('todo/', TodoDetailView.as_view(), name='todo_create'),

    path('todo/<int:pk>/', TodoDetailView.as_view(), name='todo_detail'),

    path('todo/title/<str:title>/', TodoByTitleView.as_view(), name='todo_by_title')

]