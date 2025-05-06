# Project for Internship

## What I’ve done so far

- Worked on everything mentioned in the assessment requirements.
- One thing I changed is how updates are handled:
  - The requirements say: "the chatbot should return JSON which will be run by the front-end".
  - I chose not to do that :) Instead, the logic runs directly in the Flask chatbot service.
  - If that's an issue, I can change it.

## Things I didn’t ask before starting (and just realized now)

- How much time should I spend on the assessment?
- How much or in what way should I use AI while building it?

Since it’s late to ask, here are my answers:

- **Hours worked:** I didn’t track them exactly, but I definitely didn’t spend more than 10 hours on it.
- **Front-end:** I used TailwindUI for most of the components as a starting point.
  - Note: front-end design/dev is not my strong suit, but it’s something I want to improve.
- **AI usage:**
  - Mainly for Django syntax Q&A
  - Some debugging help for the chatbot (I haven’t used LangChain in a while) and some suggestions without witch the app won't work that well :))
  - Barely used it for the front-end, except for some specific chatbot component logic and some boilerplate JSX code :)

## How to run

- Create your own `.env` file with an OpenAI API token — everything should work fine.
- Go to `http://localhost:8080` to access the front end and create an account.
- Add a TODO from the special tab.
- Use the chatbot, which has memory of the session conversation.
- Although the front end doesn't execute the JSON returned in the chatbot response, I still included it to match the requirements — it's easy to remove later for a cleaner UI :)
