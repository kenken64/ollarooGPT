import { Config, SDK } from '@corbado/node-sdk';
import { ValidationError } from '@corbado/node-sdk/errors';

const projectID = process.env.CORBADO_PROJECTID;
const apiSecret = process.env.CORBADO_API_KEY;
const frontendAPI = process.env.CORBADO_FRONTENDAPI;
const backendAPI = process.env.CORBADO_BACKENDAPI;

const config = new Config(projectID, apiSecret, frontendAPI, backendAPI);
const sdk = new SDK(config);

export const authenticateCorbado = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const shortTermSessionValue = authHeader.split(' ')[1];
        try {
            const user = await sdk.sessions().validateToken(shortTermSessionValue);
            next();
        } catch (e) {
            if (e instanceof ValidationError) {
                console.log(e);
                res.sendStatus(401);
            }
        }
    } else {
        res.sendStatus(401);
    }
};