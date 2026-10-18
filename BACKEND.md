# Sangam Backend Documentation

## 1. Overview

Sangam is a platform designed to connect job seekers, entrepreneurs, startups, recruiters, and mentors through a common network. The backend manages application data, authentication, access control, opportunity listings, applicant workflows, and integrations with supporting services.

The backend is designed around Next.js server-side functionality and Supabase. Additional capabilities, such as AI-based opportunity matching, skill-gap analysis, idea validation, and recruiter trust scoring, should be integrated as their implementations become available.

## 2. Technology Stack

| Technology | Purpose |
|---|---|
| Next.js App Router | Application routing and server-side request handling |
| TypeScript | Type safety and maintainable code |
| Supabase | Backend services and database integration |
| PostgreSQL | Relational data storage |
| Supabase Auth | User authentication and session management |
| Row-Level Security (RLS) | Database-level access control |
| Zod | Request and data validation |
| Gemini API | Planned AI-powered features, where configured |

Refer to `package.json` and the actual source code for the dependencies and integrations currently installed.

## 3. Backend Responsibilities

The backend is responsible for:

- **Authentication:** Identify authenticated users and validate their sessions.
- **Authorization:** Restrict operations according to user roles and resource ownership.
- **Opportunity management:** Retrieve and create job or internship opportunities.
- **Applicant management:** Track applications and update applicant statuses.
- **Database operations:** Read and write application data through Supabase.
- **Input validation:** Validate request bodies, query parameters, identifiers, and supported status values.
- **Error handling:** Return consistent HTTP status codes and safe error messages.
- **Future integrations:** Support AI matching, skill-gap recommendations, idea validation, recruiter verification, and real-time updates when implemented.

## 4. Project Structure

The following is a logical structure for backend-related code. Actual file locations may differ depending on the existing repository.

```text
sangam/
├── app/
│   └── api/
│       └── opportunities/
│           ├── route.ts
│           └── [id]/
│               └── applicants/
│                   └── [applicantId]/
│                       └── route.ts
├── lib/
│   └── supabase/
│       ├── client.ts
│       └── server.ts
├── package.json
├── .env.example
├── .gitignore
└── BACKEND.md
```

- `app/api/`: Next.js Route Handlers for HTTP requests.
- `lib/`: Shared server-side utilities, validation logic, and service functions.
- `lib/supabase/`: Supabase client configuration, where applicable.
- `.env.example`: Names of required environment variables without actual secrets.
- `BACKEND.md`: Backend architecture, API contracts, security rules, and development workflow.

Keep the documentation aligned with the actual source tree.

## 5. API Design and Workflow

Next.js Route Handlers use files named `route.ts` inside the `app` directory. They can implement methods such as GET, POST, PATCH, and DELETE.

### Opportunity APIs

The following API contracts describe the intended recruiter and applicant workflow. Confirm that the corresponding handlers exist and match these contracts before treating them as implemented.

| Method | Endpoint | Intended responsibility |
|---|---|---|
| GET | `/api/opportunities?mine=true` | Retrieve opportunities owned by the authenticated recruiter |
| POST | `/api/opportunities` | Validate and create a new opportunity |
| PATCH | `/api/opportunities/[id]/applicants/[applicantId]` | Update an applicant's permitted status for an opportunity |

### Request Processing Workflow

1. The client sends an HTTP request to the relevant API endpoint.
2. The route handler validates the request method, parameters, and input data.
3. The backend authenticates the user and checks permissions.
4. The backend verifies resource ownership where required.
5. Validated data is processed and persisted through Supabase.
6. The handler returns a structured JSON response with an appropriate HTTP status.
7. The client updates the interface based on the result.

### Suggested HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Request completed successfully |
| 201 | Resource created successfully |
| 400 | Invalid request data |
| 401 | Authentication required |
| 403 | User lacks permission |
| 404 | Resource not found |
| 409 | Conflicting resource state |
| 500 | Unexpected server error |

Use status codes consistently with each endpoint's actual behavior.

## 6. Authentication and Authorization

Authentication establishes the identity of a user; authorization determines which operations that user may perform.

Backend handlers should:

- Validate the current Supabase session using the configured server-side client.
- Reject unauthenticated requests to protected endpoints.
- Verify that recruiters can modify only opportunities they own.
- Check that an applicant belongs to the specified opportunity before updating their status.
- Validate permitted roles and state transitions on the server.
- Avoid relying solely on frontend checks for access control.

Database permissions and Row-Level Security policies should enforce appropriate restrictions independently of the user interface.

## 7. Database Integration

Supabase PostgreSQL is the intended relational data store.

Potential data entities include:

- **Profiles:** User details, roles, skills, and preferences.
- **Opportunities:** Job and internship listings, requirements, and recruiter ownership.
- **Applications:** Applicant, opportunity, status, and relevant timestamps.
- **Ideas and polls:** Startup ideas, poll options, and recorded responses.
- **Reviews and hiring records:** Evidence and feedback associated with relevant users or organizations.

These entities are conceptual until confirmed by the actual database schema.

Database operations should use validated inputs, explicit query filters, appropriate constraints, and consistent error handling. Avoid exposing private records through unrestricted queries.

## 8. Input Validation and Error Handling

Use Zod or the project's existing validation utilities to validate untrusted input.

Validation should cover:

- Required fields and data types.
- String length and acceptable values.
- UUIDs or other identifier formats used by the database.
- Supported application statuses.
- Numeric ranges and pagination limits where applicable.

Return safe, predictable error responses. Do not expose database credentials, stack traces, private user information, or internal implementation details to clients.

## 9. Environment Configuration

Keep local configuration in `.env.local` and provide a sanitized `.env.example` for developers.

Typical configuration names may include:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
```

Use the key names expected by the existing application. Modern Supabase projects may use a publishable key instead of the legacy anonymous key.

**Security requirements:**

- Never commit `.env.local` or real API keys.
- Never expose a Supabase secret or service-role key through client-side code.
- Use server-only environment variables for privileged operations.
- Enable and test appropriate RLS policies.
- If a secret has been exposed, rotate it promptly.

## 10. Testing and Verification

Before submitting backend changes:

1. Install dependencies using the repository's package manager.
2. Run the available lint and type-check scripts.
3. Run the production build if supported.
4. Test successful and unsuccessful API requests.
5. Verify authentication, authorization, and resource ownership.
6. Test invalid input and missing-resource scenarios.
7. Confirm that database writes persist correctly.
8. Review the final Git diff for secrets and unrelated changes.

Use the scripts actually defined in `package.json`; do not assume every test command is configured.

## 11. Local Development Setup

1. Clone the repository.
2. Install dependencies using the project's package manager.
3. Configure the required environment variables in `.env.local`.
4. Confirm that the Supabase project and required schema are available.
5. Start the development server using the configured development script.
6. Test the relevant pages and API endpoints locally.

Example commands:

```bash
npm install
npm run dev
```

Use the package manager and lockfile already present in the repository. Never share environment files containing secrets.

## 12. Git and Contribution Workflow

Use a feature branch for isolated backend or documentation changes.

1. Pull the latest changes from the intended base branch.
2. Create or switch to an appropriate feature branch.
3. Implement the change and update relevant documentation.
4. Run available checks and inspect the diff.
5. Stage only the intended files.
6. Create a descriptive commit.
7. Push the feature branch to GitHub.
8. Open a pull request for review and merge according to team conventions.

Example commit messages:

- `docs: add backend documentation`
- `feat: add opportunity API validation`
- `fix: enforce recruiter ownership checks`

Avoid committing directly to a protected or shared base branch unless your team explicitly permits it.

## 13. Future Enhancements

Potential backend enhancements for Sangam include:

- AI-powered opportunity matching and explanations.
- Skill-gap analysis and personalized learning recommendations.
- Idea feedback and validation scoring.
- Candidate-confirmed hiring and recruiter trust scoring.
- Verified reviews and suspicious-listing detection.
- Real-time updates for applications, Q&A, and community polls.
- Automated API tests and continuous integration.

These are roadmap items unless corresponding implementations already exist.

## 14. References

- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers
- Supabase with Next.js: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- Supabase server-side authentication: https://supabase.com/docs/guides/auth/server-side

---

**Documentation note:** This file describes the backend architecture, intended API contracts, security practices, and development workflow. Update it whenever the implementation, API behavior, database schema, or environment configuration changes.