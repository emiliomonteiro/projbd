import Joi from 'joi';

const movieSchema = Joi.object({
    title: Joi.string().required().min(1).max(255),
    genre: Joi.string().required().min(1).max(100),
    poster: Joi.string().uri().required(),
    available: Joi.boolean().required(),
    description: Joi.string().max(1000),
    releaseYear: Joi.number().integer().min(1900).max(new Date().getFullYear()),
    director: Joi.string().max(100),
    cast: Joi.array().items(Joi.string().max(100))
});

const customerSchema = Joi.object({
    nome: Joi.string().required().min(1).max(100),
    email: Joi.string().email().required(),
    telefone: Joi.string().pattern(/^\+?[\d\s-]{10,}$/).required(),
    cidade: Joi.string().required().max(100),
    estado: Joi.string().required().length(2)
});

const commentSchema = Joi.object({
    movie: Joi.string().required(),
    user: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required().min(1).max(500)
});

const rentalSchema = Joi.object({
    cliente_id: Joi.number().required(),
    filme_id: Joi.number().required(),
    data_devolucao: Joi.date().min('now').required()
});

export const validateMovie = (req, res, next) => {
    const { error } = movieSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

export const validateCustomer = (req, res, next) => {
    const { error } = customerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

export const validateComment = (req, res, next) => {
    const { error } = commentSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

export const validateRental = (req, res, next) => {
    const { error } = rentalSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}; 