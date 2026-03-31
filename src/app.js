const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const authRoutes = require("./routes/auth.routes");
const clientRoutes = require('./routes/client.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const paymentRoutes = require('./routes/payment.routes');
const recoveryActionRoutes = require('./routes/recoveryAction.routes');
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./lib/swagger");
const basicAuth = require("express-basic-auth");




const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(cookieParser());

app.use("/api-docs",
  basicAuth({
    users: {
      [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
    },
    challenge: true,
  }), swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Recouvra+ API",
  swaggerOptions: {
    persistAuthorization: true,  // keeps token between page refreshes
    defaultModelsExpandDepth: -1, // hides the schemas section at the bottom
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { display: none }
    .swagger-ui .scheme-container { display: none }
  `,
}));
app.use("/api/auth", authRoutes);

app.use("/api/client/", clientRoutes );
app.use("/api/invoice/", invoiceRoutes );

app.use("/api/payment/",paymentRoutes  );
app.use("/api/recovery-action/",recoveryActionRoutes  );

module.exports = app;
