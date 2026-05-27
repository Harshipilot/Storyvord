Backend AI Task Processing System
Overview

This project is a backend AI processing system built using Django + Django REST Framework, Celery, and Redis, designed to handle long-running AI tasks asynchronously.

The system allows users to:

Submit AI processing jobs (text/email/translation-type tasks)
Track job status in real time
Retrieve final results via API
Continue using the system without waiting for processing to complete

The design follows a decoupled, scalable architecture suitable for production-grade asynchronous systems.

Architecture Overview

The system is divided into clearly separated layers:

1. API Layer (Django REST Framework)
Handles authentication and request validation
Exposes endpoints for:
Task submission
Task status tracking
Result retrieval
2. Authentication Layer
JWT-based authentication
Secures all API endpoints
Ensures stateless and scalable user sessions
3. Task Queue System (Celery + Redis)
Celery handles asynchronous execution of AI tasks
Redis acts as the message broker
Prevents blocking of API requests during heavy processing
4. AI Processing Layer (LLM Abstraction)
Supports multiple providers:
Gemini API
OpenAI API
Implemented as a modular client wrapper
Easily swappable without affecting core system logic
5. Fallback System
Mock response generator when AI APIs fail
Ensures system reliability even under:
API downtime
quota exhaustion
invalid keys
Workflow
User submits a task via API
Django creates a task entry in the database
Celery worker picks up the task asynchronously
AI service (Gemini/OpenAI) processes the request
Result is stored in database
User polls API to retrieve:
task status (PENDING / IN_PROGRESS / COMPLETED / FAILED)
final output once ready
Major Challenges Faced
1. Gemini API Errors (400 / 403 / 404)
Issues caused by:
Incorrect model names
API not enabled for Generative Language API
Restricted project access
Resulted in task failures inside Celery workers
2. OpenAI SDK Migration Issues
Old ChatCompletion.create() method became deprecated
Required migration to new OpenAI client structure
Updated integration layer accordingly
3. API Key & Quota Problems
401 errors due to invalid keys
429 errors due to rate limiting / quota exhaustion
Handled using fallback mock responses
4. Environment Configuration Issues
Debugged .env loading using python-dotenv
Verified runtime injection of:
API keys
database config
Redis URL
5. Celery Debugging Complexity
Worker-side errors were initially hard to trace
Improved logging at:
task start
API request
AI response
exception handling
Debugging Approach
Used detailed Celery worker logs to trace execution flow
Tested APIs independently using sample payloads
Added structured logging for:
API status codes
exception stack traces
Introduced fallback system to isolate external dependency failures
Key Design Decisions
1. Asynchronous Architecture

Celery was chosen to ensure:

Non-blocking API responses
Scalability for long-running AI tasks
2. AI Layer Abstraction

All LLM calls are wrapped in a single module:

Enables switching between OpenAI and Gemini easily
Avoids vendor lock-in
3. Fallback System
Ensures system reliability even if AI providers fail
Prevents task pipeline breakdown
4. JWT Authentication
Stateless authentication
Suitable for distributed backend systems
Tradeoffs
1. Simplicity vs Scalability
Redis + Celery chosen over more complex event systems (Kafka)
Keeps system lightweight and easier to deploy
2. API Dependency vs Fallback Reliability
External AI APIs improve quality but introduce instability
Mock fallback ensures consistent system behavior
3. Logging vs Performance
Increased logging improves debugging but slightly impacts performance
Limitations
No real-time WebSocket updates (polling-based status tracking used)
No distributed Celery scaling setup (single worker assumed)
AI response quality depends on external API availability
No retry backoff strategy beyond basic error handling
Future Improvements
Add WebSocket-based live task updates
Introduce retry queues with exponential backoff
Dockerize full system (Django + Celery + Redis)
Add monitoring (Prometheus / Grafana)
Switch to event-driven architecture for high scale
AI Tools Usage Disclosure

AI tools (ChatGPT / LLM assistants) were used for:

Debugging Celery and API integration issues
Structuring AI abstraction layer design
Assisting in writing boilerplate code patterns

All generated outputs were:

Verified manually
Tested in runtime environment
Modified to match project architecture
Conclusion

This system demonstrates a complete backend architecture for asynchronous AI processing with:

Modular design
Fault tolerance
Scalable task processing
External API integration with fallback safety