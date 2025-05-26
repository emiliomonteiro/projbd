const { ObjectDB } = require('objectdb');

class ProductService {
    constructor() {
        this.db = new ObjectDB('products');
    }

    async createProduct(product) {
        return await thid.db.create(product);
    }

    async getProducts() {
        return await this.db.findById(id);
    }

    async updateProduct(id, attributes) {
        return await thid.db.update(id, attributes);
    }

    async deleteProduct(id) {
        return await this.db.delete(id);
    }

    async searchProducts(query) {
        return await this.db.search(query);
    }
}

module.exports = new ProductService();