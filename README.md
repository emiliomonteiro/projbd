# Movie Rental System

A modern movie rental system using PostgreSQL and MongoDB for optimal performance and data management.

## Features

- Movie and customer management using PostgreSQL for relational data
- Comments and ratings using MongoDB for flexible document storage
- Rental tracking and management
- Dashboard with analytics and reporting
- RESTful API with proper validation and error handling
- Security features including helmet
- Compression and caching for better performance

## Prerequisites

- Node.js >= 16.0.0
- PostgreSQL >= 12
- MongoDB >= 4.4
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd movie-rental-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=locadora
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=locadora_dw

# JWT Configuration (if needed)
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=app.log
```

4. Set up the databases:

### PostgreSQL
```sql
CREATE DATABASE locadora;
\c locadora

-- Create tables
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE filmes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    disponivel BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    filme_id INTEGER REFERENCES filmes(id),
    data_locacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_devolucao TIMESTAMP NOT NULL,
    devolvido BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create data warehouse schema
CREATE SCHEMA dw;

CREATE TABLE dw.dim_produto (
    produto_id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dw.fact_locacao (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES dw.dim_produto(produto_id),
    valor_locacao DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB
The MongoDB database will be automatically created when the application starts.

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. For production:
```bash
npm start
```

## API Endpoints

### Movies
- `GET /api/movies` - Get all movies
- `POST /api/movies` - Create a new movie
- `GET /api/movies/:id` - Get a specific movie
- `PUT /api/movies/:id` - Update a movie
- `DELETE /api/movies/:id` - Delete a movie

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/:id` - Get a specific customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer

### Comments
- `GET /api/comments` - Get all comments
- `POST /api/comments` - Create a new comment
- `GET /api/comments/:id` - Get a specific comment
- `DELETE /api/comments/:id` - Delete a comment

### Rentals
- `GET /api/rentals` - Get all rentals
- `POST /api/rentals` - Create a new rental
- `GET /api/rentals/:id` - Get a specific rental
- `PUT /api/rentals/:id` - Update a rental status

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

### Analytics
- `GET /api/analytics/clustering` - Get client clustering analysis
- `GET /api/analytics/prediction` - Get sales predictions

## Development

- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Security Features

- Helmet for security headers
- Rate limiting to prevent abuse
- Input validation using Joi
- CORS configuration
- Error handling middleware
- Secure database connections

## Performance Optimizations

- Connection pooling for PostgreSQL
- MongoDB connection optimization
- Compression middleware
- Proper indexing on database tables
- Efficient query patterns
- Caching strategies

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.