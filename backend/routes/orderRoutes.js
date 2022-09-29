import express from 'express';
import sql from 'mssql';
import expressAsyncHandler from 'express-async-handler';
import sqlConfig from '../constants/sqlConfig.js';
import { v4 as uuidv4 } from 'uuid';
import { generateToken, isAuth } from '../utils.js';

const orderRouter = express.Router();

orderRouter.post('/', isAuth, expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);
        const request = new sql.Request();
        const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;
        const user = req.user._id;
        const uniqueId = uuidv4();
        console.log(orderItems.map((x) => ({ ...x, product: x._id }))[0]._id);
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
            console.log(recordset.recordset)
            console.log(req.user);
            const result = recordset.recordset;
            const orders = result.filter(x => parseInt(x.shopperId) === req.user._id);
            res.send(orders);
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
orderRouter.put('/:id/pay', expressAsyncHandler(async (req, res) => {
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

export default orderRouter;