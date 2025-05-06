import requests
import os

class TodoApiClient:
    def __init__(self):
        self.base_url = os.getenv('TODO_API_URL', 'http://127.0.0.1:8000/api')
        self.session = requests.Session()
    
    def _handle_response(self, response):
        response.raise_for_status()
        return response.json()
    
    def get_todos(self, token):
        url = f"{self.base_url}/todos/"
        headers = {"Authorization": f"Bearer {token}"}
        return self._handle_response(self.session.get(url, headers=headers))
    
    def get_todo_by_id(self, todo_id, token):
        url = f"{self.base_url}/todo/{todo_id}/"
        headers = {"Authorization": f"Bearer {token}"}
        return self._handle_response(self.session.get(url, headers=headers))
    
    def get_todo_by_title(self, title, token):
        url = f"{self.base_url}/todo/title/{title}/"
        headers = {"Authorization": f"Bearer {token}"}
        return self._handle_response(self.session.get(url, headers=headers))
    
    def create_todo(self, todo_data, token):
        url = f"{self.base_url}/todo/"
        headers = {"Authorization": f"Bearer {token}"}
        return self._handle_response(self.session.post(url, json=todo_data, headers=headers))
    
    def update_todo(self, todo_id, todo_data, token):
        url = f"{self.base_url}/todo/{todo_id}/"
        headers = {"Authorization": f"Bearer {token}"}
        return self._handle_response(self.session.put(url, json=todo_data, headers=headers))
    
    def delete_todo(self, todo_id, token):
        url = f"{self.base_url}/todo/{todo_id}/"
        headers = {"Authorization": f"Bearer {token}"}
        response = self.session.delete(url, headers=headers)
        response.raise_for_status()
        return {"status": "deleted", "id": todo_id}