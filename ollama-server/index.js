import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import 'dotenv/config'
import chatRouter from './routes/chatRoutes.js';
import {SDK, Config} from '@corbado/node-sdk';
 
const projectID = process.env.CORBADO_PROJECTID;
const apiSecret = process.env.CORBADO_API_KEY;
 
const config = new Config(projectID, apiSecret);
const sdk = new SDK(config);
const app = express()
const port = process.env.APP_PORT;

for (const key in process.env) {
  console.log(key)
  console.log(process.env[key]);
}
app.use(cors());
app.use(morgan('tiny'));
app.use(express.static('public'))

app.use('/api', chatRouter);

app.listen(port, process.env.APP_HOST,() => {
  console.log(`Ollama API Server listening on port ${port}`)
})
