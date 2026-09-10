# Automatic Interview Preparation Guide Maintenance Rule

## Core Rule
Whenever any code modification, feature addition, architectural decision, backend endpoint, database schema update, or bug fix is implemented in this project:
1. **Always automatically update `INTERVIEW_PREPARATION_GUIDE.md`** at the workspace root before concluding the task.
2. **Never require the user to remind you** to update this file.
3. For every new step/milestone:
   - Add a new numbered **Chronological Development Step** with:
     - Objective & Route/Feature overview.
     - Complete code snippets and line-by-line breakdown.
     - Key engineering concepts, middleware explanations, and database behaviors.
     - Testing/verification instructions (e.g. Postman requests, curl commands, or browser steps).
   - Add new high-yield **Technical Interview Questions & Model Answers** covering the underlying mechanisms (HTTP status codes, Mongoose internals, Express middleware, React behaviors, concurrency, security, etc.).
