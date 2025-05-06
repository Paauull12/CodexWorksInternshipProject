from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from typing import Optional
import os
import json

class TodoAction(BaseModel):
    action_type: str = Field(description="The type of action to perform (create, update, delete, list, get)")
    todo_id: Optional[int] = Field(None, description="The ID of the todo, if applicable")
    title: Optional[str] = Field(None, description="The title of the todo")
    description: Optional[str] = Field(None, description="The description of the todo")
    status: Optional[str] = Field(None, description="The status of the todo (notstarted, inprogress, done)")
    dependency: Optional[int] = Field(None, description="The ID of the todo this one depends on")
    due_date: Optional[str] = Field(None, description="The due date of the todo in YYYY-MM-DDThh:mm:ssZ format")

class IntentParser:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.llm = ChatOpenAI(temperature=0, api_key=api_key)
        
        self.prompt_template = """
        You are an AI assistant that helps users manage their TODOs through natural language.
        Based on the user's message, determine what action they want to perform with their TODOs.
        
        Here are the possible actions:
        - create: Create a new TODO
        - update: Update an existing TODO
        - delete: Delete a TODO
        - list: List all TODOs
        - get: Get a specific TODO by ID or title
        
        Status values must be one of: notstarted, inprogress, done
        
        User message: {message}
        
        Return a JSON object with the following structure:
        {{
            "action_type": string (create, update, delete, list, or get),
            "todo_id": number or null,
            "title": string or null,
            "description": string or null,
            "status": string or null,
            "dependency": number or null,
            "due_date": string or null
        }}
        
        JSON response:
        """
        
        self.prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a helpful assistant that parses user intent for a TODO app."),
            ("human", self.prompt_template)
        ])
    
    def parse_intent(self, user_message):
        try:
            messages = self.prompt.format_messages(message=user_message)
            
            response = self.llm.invoke(messages)
            
            response_text = response.content.strip()
            try:
                response_json = json.loads(response_text)
                
                action = TodoAction(
                    action_type=response_json.get("action_type", "list"),
                    todo_id=response_json.get("todo_id"),
                    title=response_json.get("title"),
                    description=response_json.get("description"),
                    status=response_json.get("status"),
                    dependency=response_json.get("dependency"),
                    due_date=response_json.get("due_date")
                )
                return action
            except json.JSONDecodeError as e:
                print(f"Error parsing JSON: {e}")
                print(f"Response text: {response_text}")
                return TodoAction(action_type="list")
                
        except Exception as e:
            print(f"Error parsing intent: {e}")
            return TodoAction(action_type="list")