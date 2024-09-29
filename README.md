# Peace Dental Backend

The Peace Dental backend is a Node.js and Express server designed to power the Peace Dental web application. This robust server handles user authentication, data management, and API interactions with a PostgreSQL database using Drizzle ORM. Built with TypeScript, the backend follows the MVC architecture and incorporates JWT for secure authentication and authorization.

## Table of Contents

- [Peace Dental Backend](#peace-dental-backend)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)


## Features

- **User Authentication**: JWT-based authentication to secure user sessions.
- **Patient Management**: CRUD operations for managing patient records.
- **Appointment Management**: Create, update, and delete patient appointments.
- **Invoice Management**: Handle invoice creation and updates.
- **Revenue Metrics**: Access revenue data, restricted to admin users.
- **Middleware for Authentication**: Protect routes using custom middleware.
- **Error Handling**: Comprehensive error handling for API responses.

## Technologies

- **Node.js**: Server runtime for building the application.
- **Express.js**: Web framework for building APIs.
- **TypeScript**: Superset of JavaScript for type safety and better tooling.
- **PostgreSQL**: Relational database for data storage.
- **Drizzle ORM**: Type-safe database interaction.
- **JWT**: Authentication token for secure user sessions.
- **Other Libraries**: `bcrypt` for password validation, `dotenv` for environment variable management.



