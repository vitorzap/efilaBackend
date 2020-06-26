require('dotenv').config();

const express = require('express');
const cors = require('cors');

// import path from 'path';
// import Youch from 'youch';
// import * as Sentry from '@sentry/node';
// import 'express-async-errors';

const routes = require('./routes');
// import sentryConfig from './config/sentry';

require('./database');

class App {
  constructor() {
    // this.server = express();
    this.server = express();
    this.http = require('http').Server(this.server);
    this.io = require('socket.io').listen(this.http);
    //
    const corsOptions = {
      credentials: true,
      origin: (origin, callback) => {
        console.log('Origin', origin);
        return callback(null, true);
      }
    };

    this.server.use(cors(corsOptions));

    // this.server.use(cors());

    // Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    // this.exceptionHandler();
  }

  middlewares() {
    // this.server.use(Sentry.Handlers.requestHandler());
    this.server.use((req, res, next) => {
      try {
        req.io = this.io;
      } catch (err) {
        return res.status(401).json({ error: err.message });
      }
      next();
    });
    this.server.use(express.json());
    // this.server.use(
    //   '/files',
    //   express.static(path.resolve(__dirname, '..', 'temp', 'uploads'))
    // );
  }

  routes() {
    this.server.use(routes);
    // this.server.use(Sentry.Handlers.errorHandler());
  }

  // exceptionHandler() {
  //   this.server.use(async (err, req, res, next) => {
  //     if (process.env.NODE_ENV === 'development') {
  //       const errors = await new Youch(err, req).toJSON();
  //       return res.status(500).json(errors);
  //     }

  //     return res.status(500).json({ error: 'Internal server error' });
  //   });
  // }
}

// export default new App().server;
module.exports = new App().server;