from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from utils.parser import IntentParser
from utils.todo_api import TodoApiClient
import json
import os
from datetime import datetime

class TodoChain:
    def __init__(self, memory_manager):
        self.memory_manager = memory_manager
        api_key = os.getenv("OPENAI_API_KEY")
        self.llm = ChatOpenAI(temperature=0.7, api_key=api_key)
        self.intent_parser = IntentParser()
        self.todo_api = TodoApiClient()
        
        self.response_prompt = ChatPromptTemplate.from_template("""
        You are a helpful AI assistant integrated with a TODO app.
        You can help users manage their TODOs through natural conversation.
        
        Chat history:
        {chat_history}
        
        User: {user_message}
        
        Action performed: {action_performed}
        Result: {result}
        
        Respond in a natural, conversational way. Be concise but friendly.
        Don't mention the technical details of the action unless necessary.
        If the action failed, ask for more information or suggest alternatives.
        Do not reference the JSON command in your response, it will be attached automatically.
        """)
        
        self.response_chain = self.response_prompt | self.llm
    
    def _format_date(self, date_str):
        """Format date string to match the API requirements"""
        if not date_str:
            return None
            
        try:
            for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y"]:
                try:
                    dt = datetime.strptime(date_str, fmt)
                    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
                except ValueError:
                    continue
                    
            if 'T' in date_str and 'Z' in date_str:
                return date_str
                
            return datetime.now().strftime("%Y-%m-%dT00:00:00Z")
        except Exception:
            return datetime.now().strftime("%Y-%m-%dT00:00:00Z")
    
    def _execute_action(self, action, token):
        try:
            if action.action_type == "create":
                if not action.title:
                    return "missing_title", {"error": "No title provided for new TODO"}
                
                todo_data = {
                    "title": action.title,
                    "description": action.description or "",
                    "status": action.status or "notstarted",
                    "due_date": self._format_date(action.due_date)
                }
                
                if action.dependency:
                    todo_data["dependency"] = action.dependency
                
                result = self.todo_api.create_todo(todo_data, token)
                return "create_success", result
                
            elif action.action_type == "update":
                if not action.todo_id and not action.title:
                    return "missing_identifier", {"error": "No TODO ID or title provided for update"}
                
                todo_id = action.todo_id
                if not todo_id and action.title:
                    try:
                        todo = self.todo_api.get_todo_by_title(action.title, token)
                        todo_id = todo["todo"]["id"]
                    except Exception as e:
                        return "todo_not_found", {"error": f"Could not find TODO with title: {action.title}"}
                
                update_data = {}
                if action.title:
                    update_data["title"] = action.title
                if action.description:
                    update_data["description"] = action.description
                if action.status:
                    update_data["status"] = action.status
                if action.due_date:
                    update_data["due_date"] = self._format_date(action.due_date)
                if action.dependency is not None:
                    update_data["dependency"] = action.dependency
                
                result = self.todo_api.update_todo(todo_id, update_data, token)
                return "update_success", result
                
            elif action.action_type == "delete":
                if not action.todo_id and not action.title:
                    return "missing_identifier", {"error": "No TODO ID or title provided for deletion"}
                
                todo_id = action.todo_id
                if not todo_id and action.title:
                    try:
                        todo = self.todo_api.get_todo_by_title(action.title, token)
                        todo_id = todo["todo"]["id"]
                    except Exception as e:
                        return "todo_not_found", {"error": f"Could not find TODO with title: {action.title}"}
                
                result = self.todo_api.delete_todo(todo_id, token)
                return "delete_success", result
                
            elif action.action_type == "get":
                if action.todo_id:
                    result = self.todo_api.get_todo_by_id(action.todo_id, token)
                    return "get_success", result
                elif action.title:
                    result = self.todo_api.get_todo_by_title(action.title, token)
                    return "get_success", result
                else:
                    return "missing_identifier", {"error": "No TODO ID or title provided to get"}
                
            elif action.action_type == "list":
                result = self.todo_api.get_todos(token)
                return "list_success", result
                
            else:
                return "unknown_action", {"error": f"Unknown action type: {action.action_type}"}
                
        except Exception as e:
            return "error", {"error": str(e)}
    
    def process(self, user_message, token):
        self.memory_manager.add_message(token, "user", user_message)
        
        chat_history = self.memory_manager.get_history(token)
        
        parsed_action = self.intent_parser.parse_intent(user_message)
        
        action_status, result = self._execute_action(parsed_action, token)
        
        command_info = {
            "action": parsed_action.dict(),
            "status": action_status,
            "result": result
        }
        
        formatted_history = "\n".join([
            f"{msg.type.capitalize()}: {msg.content}" 
            for msg in chat_history[:-1] 
        ]) if len(chat_history) > 1 else ""
        
        command_json = json.dumps(command_info, indent=2)
        
        response = self.response_chain.invoke({
            "chat_history": formatted_history,
            "user_message": user_message,
            "action_performed": parsed_action.action_type,
            "result": json.dumps(result),
            "command_json": command_json 
        }).content
        
        final_response = f"{response}\n\n```json\n{command_json}\n```"
        
        self.memory_manager.add_message(token, "ai", response)
        
        return final_response, command_info