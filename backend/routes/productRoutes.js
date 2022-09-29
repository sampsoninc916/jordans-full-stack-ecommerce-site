import express from 'express';
import sql from 'mssql';
import sqlConfig from '../constants/sqlConfig.js';
import expressAsyncHandler from 'express-async-handler';

const productRouter = express.Router();

productRouter.get('/', async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);

        const request = new sql.Request();
        request.query('SELECT * FROM products', (err, recordset) => {
            if (err) console.log(err);
            res.send(recordset.recordset);
        });
    });
});
const PAGE_SIZE = 3;
productRouter.get('/search', expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const brand = query.brand || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);

        const request = new sql.Request();
        request.query('SELECT * FROM products', (err, recordset) => {
            if (err) console.log(err);
            console.log(searchQuery);
            const results = recordset.recordset;
            const filteredResults = results.filter((result, i, results) => {
                if (searchQuery && searchQuery !== '') {
                    return result.name.includes(searchQuery) ||
                    result.description.includes(searchQuery) ||
                    result.name.includes(searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)) ||
                    result.description.includes(searchQuery.charAt(0).toUpperCase() + searchQuery.slice(1)) ||
                    result.name.includes(searchQuery.toUpperCase()) ||
                    result.description.includes(searchQuery.toUpperCase())
                }
            });
            res.send(filteredResults);
        });
    });
}));
productRouter.get('/categories', expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);

        const request = new sql.Request();
        request.query('SELECT * FROM products', (err, recordset) => {
            if (err) console.log(err);
            const products = recordset.recordset;
            const categories = products.map(product => product.category).filter((category, index, categories) => categories.indexOf(category) === index);
            res.send(categories);
            // res.send(recordset.recordset);
        });
    });
}));
productRouter.get('/slug/:slug', async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);

        const request = new sql.Request();
        request.query('SELECT * FROM products', (err, recordset) => {
            if (err) console.log(err);
            const products = recordset.recordset;
            const product = products.find(x => x.slug === req.params.slug);
            if (!product) res.status(404).send({ message: 'Product Not Found' });
            res.send(product);
        });
    });
});
productRouter.get('/:id', async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);

        const request = new sql.Request();
        request.query('SELECT * FROM products', (err, recordset) => {
            if (err) console.log(err);
            const products = recordset.recordset;
            const product = products.find(x => x._id === req.params.id);
            if (!product) res.status(404).send({ message: 'Product Not Found' });
            res.send(product);
        });
    });
});

export default productRouter;