from langchain.memory import ConversationBufferMemory

class ConversationMemory:
    def __init__(self):
        self.memories = {}
    
    def get_memory(self, token):
        memory_key = str(hash(token))
        if memory_key not in self.memories:
            self.memories[memory_key] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
        return self.memories[memory_key]
    
    def add_message(self, token, role, content):
        memory = self.get_memory(token)
        if role == "user":
            memory.chat_memory.add_user_message(content)
        else:
            memory.chat_memory.add_ai_message(content)
    
    def get_history(self, token):
        memory = self.get_memory(token)
        return memory.chat_memory.messages