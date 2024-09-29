import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import 'dotenv/config'
import chatRouter from './routes/chatRoutes.js';
import {SDK, Config} from '@corbado/node-sdk';
 
const projectID = process.env.CORBADO_PROJECTID;
const apiSecret = process.env.CORBADO_API_KEY;
const frontendAPI = process.env.CORBADO_FRONTENDAPI;
const backendAPI = process.env.CORBADO_BACKENDAPI;

const config = new Config(projectID, apiSecret, frontendAPI, backendAPI);
const sdk = new SDK(config);
const app = express()
const port = process.env.APP_PORT;

app.use(cors());

morgan.token('body', req => {
  return JSON.stringify(req.headers) + "\n" 
            +JSON.stringify(req.body)
})

app.use(morgan(':method :url :body'))

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }));
app.use('/api', chatRouter);

app.listen(port ,() => {
  console.log(`Ollama API Server listening on port ${process.env.APP_HOST}:${port}`)
})
