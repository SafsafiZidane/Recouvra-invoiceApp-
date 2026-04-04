# Recouvra Invoice App - AI Coding Guidelines

## Architecture Overview
This is a Node.js Express API for debt collection/recovery management. Key components:
- **MVC Structure**: Models (Mongoose schemas), Controllers (business logic), Routes (endpoints), Middlewares (auth/validation)
- **Authentication**: JWT tokens stored in httpOnly cookies, role-based access (agent/manager/admin)
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Joi schemas for input validation
- **Documentation**: Swagger UI at `/api-docs` (protected by basic auth)

## Key Patterns & Conventions

### Authentication & Authorization
- Use `protectRoute` middleware for JWT verification from cookies
- Use `authorizeRoles("admin", "manager")` for role-based access
- Password field: `select: false` by default; use `.select("+password")` for login
- Only admins can register new users via `/api/auth/register`

### Data Models
- All models use Mongoose with validation rules (required, min/max length)
- Example user schema: name, email (unique), password (min 8 chars), role (agent/manager/admin)
- Relationships: Clients have invoices, invoices have payments and recovery actions

### Validation
- Use Joi schemas in `/validators/` for request validation
- Example: `registerSchema` validates name (2-50 chars), email, password (min 8), role enum

### Error Handling
- Controllers return JSON: `{ message: "error description" }` with appropriate status codes
- 400 for validation errors, 401 for auth, 403 for permissions, 500 for server errors

### API Structure
- Routes: `/api/auth`, `/api/client`, `/api/invoice`, `/api/payment`, `/api/recovery-action`
- Controllers handle CRUD operations with try/catch blocks
- Middlewares applied per route for auth and validation

## Development Workflow
- **Start dev server**: `npm run dev` (nodemon watches `src/server.js`)
- **Environment**: Set `MONGODB_URI`, `JWT_SECRET`, `SWAGGER_USER`, `SWAGGER_PASSWORD` in `.env`
- **Database connection**: Auto-connects on server start via `config/db.js`
- **Testing**: Placeholder test scripts; implement with Jest/Supertest for API endpoints

## Code Examples
- **Auth middleware usage**: `router.post("/protected", protectRoute, authorizeRoles("admin"), controller)`
- **Model query**: `User.findOne({ email }).select("+password")`
- **Token generation**: `generateToken(user._id, user.role, res)` sets cookie automatically

## Dependencies
- Express 5.x, Mongoose 9.x, JWT, bcryptjs, Joi, Swagger
- Security: helmet, cors, cookie-parser

Focus on role-based permissions and secure auth patterns when adding features.