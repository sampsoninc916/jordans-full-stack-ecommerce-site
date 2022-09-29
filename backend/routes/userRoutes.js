import express from 'express';
import sql from 'mssql';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import sqlConfig from '../constants/sqlConfig.js';
import { generateToken, isAuth } from '../utils.js';

const userRouter = express.Router();

userRouter.post('/signin', expressAsyncHandler(async (req, res) => {
    sql.connect(sqlConfig, (err) => {
        if (err) console.log(err);

        const request = new sql.Request();
        request.query('SELECT * FROM users', (err, recordset) => {
            if (err) console.log(err);
            const users = recordset.recordset;
            const user = users.find(x => x.email === req.body.email);
            if (user) {
                if (bcrypt.compareSync(req.body.password, user.password)) {
                  res.send({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user),
                  });
                  return;
                }
            }
            res.status(401).send({ message: 'Invalid email or password' });
        });
    });
}));

userRouter.post('/signup', expressAsyncHandler(async (req, res) => {
  sql.connect(sqlConfig, (err) => {
    if (err) console.log(err);

    const request = new sql.Request();
    const { body: { name, email, password } } = req;
    const encryptedPassword = bcrypt.hashSync(password);
    request.query(`INSERT INTO users (name, email, password, isAdmin) VALUES ('${name}', '${email}', '${encryptedPassword}', 0)`, (err, recordset) => {
      if (err) console.log(err);
      request.query(`SELECT * FROM users WHERE password='${encryptedPassword}'`, (err, recordset2) => {
        const user = recordset2.recordset[0];
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user)
        });
      });
    });
  });
}));

userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
  sql.connect(sqlConfig, (err) => {
    if (err) console.log(err);
    const request = new sql.Request();
    request.query(`SELECT * FROM users`, (err, recordset) => {
        if (err) res.send({ message: 'User Not Found' });
        const result = recordset.recordset;
        const user = result.find(x => parseInt(x._id) === req.user._id);
        if (user) {
          const newName = req.body.name || user.name;
          const newEmail = req.body.email || user.email;
          let newPassword = '';
          if (req.body.password) {
            newPassword = bcrypt.hashSync(req.body.password);
          }
          request.query(`UPDATE users SET name='${newName}',email='${newEmail}',password='${newPassword}' WHERE _id='${user._id}'`, (err, recordset2) => {
            request.query(`SELECT * FROM users WHERE _id='${user._id}'`, (err, recordset3) => {
              const user2 = recordset3.recordset[0];
              res.send({
                _id: user2._id,
                name: user2.name,
                email: user2.email,
                isAdmin: user2.isAdmin,
                token: generateToken(user2)
              });
            });
        });
        } else {
          res.status(404).send({ message: 'User Not Found' });
        }
    });
  });
}));

export default userRouter;