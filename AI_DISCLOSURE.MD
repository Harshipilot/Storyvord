AI Tool Usage Disclosure

This document explains how AI tools were used during the development of the backend AI task processing system.

Overview

AI tools (such as ChatGPT,GITHUB Copilot and  similar LLM-based assistants) were used as supporting development aids during the implementation of this project. They were not used as a replacement for engineering decisions, but rather as an assistant for speeding up development, debugging, and improving code structure.

All final decisions, architecture design, and core system logic were implemented and validated manually.

Areas Where AI Was Used
1. Code Generation Assistance

AI tools were used to assist in:

Generating boilerplate Django REST Framework views and serializers
Writing Celery task structures
Creating base API request/response handling patterns
Drafting LLM integration wrappers (OpenAI / Gemini client abstraction)

Note: All generated code was reviewed, modified, and adapted to fit the project architecture.

2. Debugging Support

AI was used to help identify and resolve common backend issues such as:

Celery worker configuration errors
Redis connection issues
API integration errors (Gemini / OpenAI)
Environment variable loading problems
HTTP status code interpretation (401, 403, 429, 404 errors)

Final fixes and system-level debugging were performed manually through logs and testing.

3. Configuration Guidance

AI assistance was used for:

Setting up .env structure best practices
Understanding Celery + Redis integration flow
Improving Django project configuration
Identifying correct dependency versions and migration changes (especially OpenAI SDK updates)
4. Architecture Suggestions (Initial Guidance Only)

AI was used to brainstorm and validate architectural ideas such as:

Using Celery for asynchronous processing
Separating AI layer into a modular service
Implementing fallback/mock response systems for reliability

However:

The final architecture design was decided independently
Folder structure and project organization were proposed and structured by me
Manual Work & Ownership

The following parts were fully designed and implemented without AI generation:

Overall project architecture and system design
Folder structure and modular organization
API endpoint design and workflow logic
Error handling strategy and fallback system
Celery task orchestration flow
Debugging and runtime issue resolution
Integration testing and validation
Validation Process

All AI-assisted outputs were:

Reviewed manually
Tested in local development environment
Refactored to match project standards
Verified against expected API behavior

No AI-generated code was directly used without modification or understanding.

Key Principle Followed

AI was used as an assistant, not an authority.

All critical engineering decisions were made based on:

Backend design principles
Django + Celery best practices
Runtime debugging and logs
System reliability requirements
Conclusion

AI tools significantly improved development speed and helped in debugging and structuring ideas. However, the final implementation reflects independent engineering effort, with AI acting only as a supportive tool for learning, productivity, and refinement.