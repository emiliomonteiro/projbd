const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Default error status and message
    let status = err.status || 500;
    let message = err.message || 'Erro interno do servidor';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Erro de validação: ' + err.message;
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Não autorizado';
    } else if (err.name === 'ForbiddenError') {
        status = 403;
        message = 'Acesso proibido';
    } else if (err.name === 'NotFoundError') {
        status = 404;
        message = 'Recurso não encontrado';
    }

    // Send error response
    res.status(status).json({
        error: {
            message,
            status,
            timestamp: new Date().toISOString()
        }
    });
};

module.exports = errorHandler; 