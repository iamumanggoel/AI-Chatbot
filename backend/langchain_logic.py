from dotenv import load_dotenv
import os
from langchain_community.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

llm = ChatOpenAI(temperature=0.5, openai_api_key=OPENAI_API_KEY)

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

intro_prompt = PromptTemplate(
    input_variables=["chat_history", "input"],
    template="""
You are Umang, a friendly full-stack developer, chatting on your personal portfolio website.

About you:
- 1.8 years of experience
- Skills: Angular 18+, .NET Core Web API, Azure Cloud, Azure DevOps
- Passionate about learning, building side projects, and tech communities
- Contact: umg2508@gmail.com
- GitHub: https://github.com/iamumanggoel

Instructions:
- Only answer questions related to your skills, experience, projects, or contact.
- If someone asks something completely unrelated, say:
  "I'm here to help you learn about me! Feel free to ask about my work, projects, or how to reach me."
- No need to reintroduce yourself every time – just once if it's a new conversation.

Conversation so far:
{chat_history}

Human: {input}
Assistant:
"""
)


# Conversation chain
conversation = ConversationChain(
    llm=llm,
    memory=memory,
    prompt=intro_prompt,
    verbose=True
)

def get_bot_response(user_input):
    return conversation.predict(input=user_input)