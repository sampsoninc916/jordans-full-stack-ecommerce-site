import express from 'express';
import sql from 'mssql';
import expressAsyncHandler from 'express-async-handler';
import sqlConfig from '../constants/sqlConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, isAuth, isAdmin } from '../utils.js';

const orderRouter = express.Router();

orderRouter.get('/', expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        request.query(`SELECT * FROM orders`, (err, recordset) => {
            if (err) res.send({ message: 'Order Not Found' });
            const results = recordset.recordset;
            request.query(`SELECT * FROM users`, (err, recordset) => {
                if (err) res.send({ message: 'User Not Found' });
                const results2 = recordset.recordset;
                const newResults = results.map((result) => {
                    const { shopperId } = result;
                    const user = results2.find((r) => parseInt(shopperId) === r._id);
                    if (user) {
                        return {
                            ...result,
                            user: {
                                name: user.name
                            }
                        };
                    } else {
                        return result;
                    }
                });
                res.send(newResults);
            });
        });
    });
}));
orderRouter.post('/', isAuth, expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;
        const user = req.user._id;
        const uniqueId = uuidv4();
        const currentDate = new Date(Date.now());
        const currentDateString = currentDate.toISOString().slice(0, 19).replace('T', ' ');
        request.query(`INSERT INTO orders (_id, orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, shopperId, createdAt) VALUES ('${uniqueId}', '${JSON.stringify(orderItems.map((x) => ({ ...x, product: uniqueId })))}', '${JSON.stringify(shippingAddress)}', '${paymentMethod}', ${itemsPrice}, ${shippingPrice}, ${taxPrice}, ${totalPrice}, '${user}', '${currentDateString}')`, (err, recordset) => {
            res.send({ message: 'New Order Created', order: { _id: uniqueId, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, user, createdAt: currentDateString }});
        });
    });
}));
orderRouter.get('/mine', isAuth, expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        request.query(`SELECT * FROM orders`, (err, recordset) => {
            if (err) res.send({ message: 'Order Not Found' });
            const result = recordset.recordset;
            const orders = result.filter(x => parseInt(x.shopperId) === req.user._id);
            res.send(orders);
        });
    });
}));
orderRouter.get('/summary', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        request.query(`SELECT * FROM orders`, (err, recordset) => {
            if (err) res.send({ message: 'Order Not Found' });
            const result = recordset.recordset;
            // console.log(result);
            const numOrders = result.length;
            const totalSales = result.reduce((a,b) => a + b.totalPrice, 0);
            let orderCount = 0;
            request.query(`SELECT CAST(createdAt AS date) AS dateToString, COUNT(_id) AS orders, SUM(totalPrice) AS sales FROM orders GROUP BY CAST(createdAt AS date)`, (err, recordset) => {
                const result3 = recordset.recordset;
                request.query(`SELECT category, COUNT(_id) AS count FROM products GROUP BY category`, (err, recordset) => {
                    const result4 = recordset.recordset;
                    request.query(`SELECT * FROM users`, (err, recordset) => {
                        const result2 = recordset.recordset;
                        const numUsers = result2.length;
                        res.send({
                            users: {
                                numUsers
                            },
                            orders: {
                                numOrders,
                                totalSales
                            },
                            dailyOrders: result3,
                            productCategories: result4
                        });
                    });
                });
            });
        });
    });
}));
orderRouter.get('/:id', isAuth, expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        const { params: { id } } = req;
        console.log(id);
        request.query(`SELECT * FROM orders WHERE _id='${id}'`, (err, recordset) => {
            if (err) res.send({ message: 'Order Not Found' });
            const result = recordset.recordset[0];
            console.log(result);
            const orders = JSON.parse(result.orderItems);
            const order = orders.filter(x => x.product === id);
            const shippingAddress = JSON.parse(result.shippingAddress);
            if (!order) {
                res.status(404).send({ message: 'Order Not Found' });
            } else {
                res.send({ ...result, shippingAddress, orderItems: order });
            }
        });
    });
}));
orderRouter.put('/:id/deliver', isAuth, expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        const { params: { id } } = req;
        request.query(`SELECT * FROM orders`, (err, recordset) => {
            const result = recordset.recordset[0];
            const orders = JSON.parse(result.orderItems);
            const order = orders.filter(x => x.product === id);
            if (order) {
                const currentDate = new Date(Date.now());
                const currentDateString = currentDate.toISOString().slice(0, 19).replace('T', ' ');
                request.query(`UPDATE orders SET isDelivered=1,deliveredAt='${currentDateString}' WHERE _id='${id}'`, (err, recordset) => {
                    if (err) console.log(err);
                    res.send({ message: 'Order Delivered' });
                });
            } else {
                res.status(404).send({ message: 'Order Not Found' });
            }
        });
    });
}));
orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        const { params: { id } } = req;
        request.query(`SELECT * FROM orders`, (err, recordset) => {
            if (err) console.log(err);
            const result = recordset.recordset[0];
            const orders = JSON.parse(result.orderItems);
            const order = orders.filter(x => x.product === id);
            if (order) {
                const paymentResult = JSON.stringify({
                    id: req.body.id,
                    status: req.body.status,
                    update_time: req.body.update_time,
                    email_address: req.body.email_address
                });
                const currentDate = new Date(Date.now());
                const currentDateString = currentDate.toISOString().slice(0, 19).replace('T', ' ');
                request.query(`UPDATE orders SET paymentResult='${paymentResult}',isPaid=1,paidAt='${currentDateString}' WHERE _id='${id}'`, (err, recordset2) => {
                    request.query(`SELECT * FROM orders WHERE _id='${id}'`, (err, recordset3) => {
                        if (err) console.log(err);
                        const result = recordset.recordset[0];
                        res.send({ message: 'Order Paid', order: result });
                    });
                });
            } else {
                res.status(404).send({ message: 'Order Not Found' });
            }
        });
    });
}));

orderRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const orderId = req.params.id;
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        request.query(`DELETE FROM orders WHERE _id='${orderId}'`, (err, recordset) => {
            if (err) console.log(err);
            res.send({ message: 'Order Deleted' });
        });
    });
}));

export default orderRouter;