const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Recouvra+ API",
      version: "1.0.0",
      description: "API de gestion du recouvrement",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id:        { type: "string",  example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            name:      { type: "string",  example: "Karim Ben Ali" },
            email:     { type: "string",  example: "karim@recouvra.tn" },
            role:      { type: "string",  enum: ["agent", "manager", "admin"] },
            isActive:  { type: "boolean", example: true },
            lastLogin: { type: "string",  format: "date-time" },
            createdAt: { type: "string",  format: "date-time" },
          },
        },
        Client: {
          type: "object",
          properties: {
            _id:       { type: "string",  example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            name:      { type: "string",  example: "Société ABC" },
            email:     { type: "string",  example: "contact@abc.tn" },
            phone:     { type: "string",  example: "+216 71 000 000" },
            address:   { type: "string",  example: "Tunis, Tunisia" },
            company:   { type: "string",  example: "ABC SARL" },
            isActive:  { type: "boolean", example: true },
            createdAt: { type: "string",  format: "date-time" },
          },
        },
        Invoice: {
          type: "object",
          properties: {
            _id:              { type: "string",  example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            number:           { type: "string",  example: "INV-1748392847382" },
            amount:           { type: "number",  example: 5000 },
            amountPaid:       { type: "number",  example: 2500 },
            remainingBalance: { type: "number",  example: 2500 },
            dueDate:          { type: "string",  format: "date-time" },
            status:           { type: "string",  enum: ["pending", "partial", "paid", "overdue"] },
            description:      { type: "string",  example: "Facture prestation mars 2024" },
            createdAt:        { type: "string",  format: "date-time" },
          },
        },
        Payment: {
          type: "object",
          properties: {
            _id:       { type: "string",  example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            amount:    { type: "number",  example: 2500 },
            method:    { type: "string",  enum: ["cash", "transfer", "check"] },
            date:      { type: "string",  format: "date-time" },
            note:      { type: "string",  example: "Client paid in cash" },
            createdAt: { type: "string",  format: "date-time" },
          },
        },
        RecoveryAction: {
          type: "object",
          properties: {
            _id:            { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
            type:           { type: "string", enum: ["call", "email", "letter", "visit"] },
            note:           { type: "string", example: "Client promised to pay next week" },
            outcome:        { type: "string", example: "Promised payment by March 20" },
            date:           { type: "string", format: "date-time" },
            nextActionDate: { type: "string", format: "date-time" },
            createdAt:      { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string",  example: "Something went wrong" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string",  example: "Operation successful" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],

    paths: {

      // ════════════════════════════════════════════════════════
      //  AUTH
      // ════════════════════════════════════════════════════════

      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "role"],
                  properties: {
                    name:     { type: "string",  example: "Karim Ben Ali" },
                    email:    { type: "string",  example: "karim@recouvra.tn" },
                    password: { type: "string",  example: "Secret123!" },
                    role:     { type: "string",  enum: ["agent", "manager", "admin"] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User created",         content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/User" } } } } } },
            400: { description: "Email already exists", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            500: { description: "Server error",         content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login and get a JWT token",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email:    { type: "string", example: "karim@recouvra.tn" },
                    password: { type: "string", example: "Secret123!" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful — copy the token and click Authorize", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, token: { type: "string" }, user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "Invalid credentials", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            423: { description: "Account locked",      content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current logged-in user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Current user profile", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/User" } } } } } },
            401: { description: "Not authenticated",    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/auth/change-password": {
        put: {
          tags: ["Auth"],
          summary: "Change current user password",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["oldPassword", "newPassword"],
                  properties: {
                    oldPassword: { type: "string", example: "Secret123!" },
                    newPassword: { type: "string", example: "NewSecret456!" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Password changed",          content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            400: { description: "Wrong current password",    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Not authenticated",         content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Logout current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Logged out", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
          },
        },
      },

      // ════════════════════════════════════════════════════════
      //  CLIENTS
      // ════════════════════════════════════════════════════════

      "/api/client/": {
        post: {
          tags: ["Clients"],
          summary: "Create a new client",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "phone"],
                  properties: {
                    name:    { type: "string", example: "Société ABC" },
                    email:   { type: "string", example: "contact@abc.tn" },
                    phone:   { type: "string", example: "+216 71 000 000" },
                    address: { type: "string", example: "Tunis, Tunisia" },
                    company: { type: "string", example: "ABC SARL" },
                    notes:   { type: "string", example: "Important client" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Client created",    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, client: { $ref: "#/components/schemas/Client" } } } } } },
            400: { description: "Validation error",  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        get: {
          tags: ["Clients"],
          summary: "Get all clients",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "page",   schema: { type: "integer", default: 1 },  description: "Page number" },
            { in: "query", name: "limit",  schema: { type: "integer", default: 10 }, description: "Results per page" },
            { in: "query", name: "search", schema: { type: "string" },               description: "Search by name or email" },
          ],
          responses: {
            200: { description: "List of clients", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, total: { type: "integer" }, page: { type: "integer" }, pages: { type: "integer" }, clients: { type: "array", items: { $ref: "#/components/schemas/Client" } } } } } } },
            401: { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/client/{id}": {
        get: {
          tags: ["Clients"],
          summary: "Get a client by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, description: "Client ID" }],
          responses: {
            200: { description: "Client found",     content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, client: { $ref: "#/components/schemas/Client" } } } } } },
            404: { description: "Client not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        put: {
          tags: ["Clients"],
          summary: "Update a client",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name:    { type: "string", example: "Société ABC Updated" },
                    email:   { type: "string", example: "new@abc.tn" },
                    phone:   { type: "string", example: "+216 71 111 111" },
                    address: { type: "string", example: "Sfax, Tunisia" },
                    company: { type: "string", example: "ABC SARL" },
                    notes:   { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Client updated",   content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, client: { $ref: "#/components/schemas/Client" } } } } } },
            404: { description: "Client not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Clients"],
          summary: "Deactivate a client (soft delete)",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Client deactivated", content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            404: { description: "Client not found",   content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ════════════════════════════════════════════════════════
      //  INVOICES
      // ════════════════════════════════════════════════════════

      "/api/invoice/": {
        post: {
          tags: ["Invoices"],
          summary: "Create a new invoice",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["client", "amount", "dueDate"],
                  properties: {
                    client:      { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
                    amount:      { type: "number", example: 5000 },
                    dueDate:     { type: "string", format: "date", example: "2024-06-01" },
                    description: { type: "string", example: "Facture prestation mars 2024" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Invoice created",   content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, invoice: { $ref: "#/components/schemas/Invoice" } } } } } },
            400: { description: "Validation error",  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            401: { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        get: {
          tags: ["Invoices"],
          summary: "Get all invoices",
          security: [{ bearerAuth: [] }],
          parameters: [
            { in: "query", name: "status", schema: { type: "string", enum: ["pending", "partial", "paid", "overdue"] }, description: "Filter by status" },
            { in: "query", name: "client", schema: { type: "string" },               description: "Filter by client ID" },
            { in: "query", name: "page",   schema: { type: "integer", default: 1 },  description: "Page number" },
            { in: "query", name: "limit",  schema: { type: "integer", default: 10 }, description: "Results per page" },
          ],
          responses: {
            200: { description: "List of invoices", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, total: { type: "integer" }, page: { type: "integer" }, pages: { type: "integer" }, invoices: { type: "array", items: { $ref: "#/components/schemas/Invoice" } } } } } } },
            401: { description: "Not authenticated", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/invoice/{id}": {
        get: {
          tags: ["Invoices"],
          summary: "Get an invoice by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, description: "Invoice ID" }],
          responses: {
            200: { description: "Invoice detail",    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, invoice: { $ref: "#/components/schemas/Invoice" } } } } } },
            404: { description: "Invoice not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
        delete: {
          tags: ["Invoices"],
          summary: "Delete an unpaid invoice",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "Invoice deleted",              content: { "application/json": { schema: { $ref: "#/components/schemas/Success" } } } },
            400: { description: "Cannot delete a paid invoice", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Invoice not found",            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/invoice/{id}/status": {
        put: {
          tags: ["Invoices"],
          summary: "Manually update invoice status",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["pending", "partial", "paid", "overdue"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Status updated",    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, invoice: { $ref: "#/components/schemas/Invoice" } } } } } },
            400: { description: "Invalid status",    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Invoice not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ════════════════════════════════════════════════════════
      //  PAYMENTS
      // ════════════════════════════════════════════════════════

      "/api/payment/": {
        post: {
          tags: ["Payments"],
          summary: "Record a manual payment",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["invoiceId", "amount", "method"],
                  properties: {
                    invoiceId: { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
                    amount:    { type: "number", example: 2500 },
                    method:    { type: "string", enum: ["cash", "transfer", "check"] },
                    date:      { type: "string", format: "date", example: "2024-03-15" },
                    note:      { type: "string", example: "Client paid in cash at office" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Payment recorded and invoice updated", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, payment: { $ref: "#/components/schemas/Payment" }, invoice: { $ref: "#/components/schemas/Invoice" } } } } } },
            400: { description: "Invoice already paid or overpayment",  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Invoice not found",                    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/payment/invoice/{invoiceId}": {
        get: {
          tags: ["Payments"],
          summary: "Get all payments for an invoice",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "invoiceId", required: true, schema: { type: "string" }, description: "Invoice ID" }],
          responses: {
            200: { description: "List of payments", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, invoice: { $ref: "#/components/schemas/Invoice" }, payments: { type: "array", items: { $ref: "#/components/schemas/Payment" } }, total: { type: "integer" } } } } } },
            404: { description: "Invoice not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/payment/{id}": {
        get: {
          tags: ["Payments"],
          summary: "Get a payment by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, description: "Payment ID" }],
          responses: {
            200: { description: "Payment detail",    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, payment: { $ref: "#/components/schemas/Payment" } } } } } },
            404: { description: "Payment not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      // ════════════════════════════════════════════════════════
      //  RECOVERY ACTIONS
      // ════════════════════════════════════════════════════════

      "/api/recovery-action/": {
        post: {
          tags: ["Recovery Actions"],
          summary: "Log a recovery action",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["invoiceId", "type", "note"],
                  properties: {
                    invoiceId:      { type: "string", example: "64f1a2b3c4d5e6f7a8b9c0d1" },
                    type:           { type: "string", enum: ["call", "email", "letter", "visit"] },
                    note:           { type: "string", example: "Client promised to pay next week" },
                    outcome:        { type: "string", example: "Promised payment by March 20" },
                    date:           { type: "string", format: "date", example: "2024-03-13" },
                    nextActionDate: { type: "string", format: "date", example: "2024-03-20" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Action logged",     content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, action: { $ref: "#/components/schemas/RecoveryAction" } } } } } },
            400: { description: "Validation error",  content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            404: { description: "Invoice not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/recovery-action/invoice/{invoiceId}": {
        get: {
          tags: ["Recovery Actions"],
          summary: "Get all recovery actions for an invoice",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "invoiceId", required: true, schema: { type: "string" }, description: "Invoice ID" }],
          responses: {
            200: { description: "List of actions", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, invoice: { $ref: "#/components/schemas/Invoice" }, actions: { type: "array", items: { $ref: "#/components/schemas/RecoveryAction" } }, total: { type: "integer" } } } } } },
            404: { description: "Invoice not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },

      "/api/recovery-action/{id}": {
        get: {
          tags: ["Recovery Actions"],
          summary: "Get a recovery action by ID",
          security: [{ bearerAuth: [] }],
          parameters: [{ in: "path", name: "id", required: true, schema: { type: "string" }, description: "Action ID" }],
          responses: {
            200: { description: "Action detail",    content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, action: { $ref: "#/components/schemas/RecoveryAction" } } } } } },
            404: { description: "Action not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          },
        },
      },
    },
  },

  apis: [], // everything is defined above — no file scanning needed
};

const swaggerSpec = swaggerJsDoc(options);
module.exports = swaggerSpec;