import { Config, SDK } from '@corbado/node-sdk';
import { ValidationError } from '@corbado/node-sdk/errors';

const projectID = process.env.CORBADO_PROJECTID;
const apiSecret = process.env.CORBADO_API_KEY;
const frontendAPI = process.env.CORBADO_FRONTENDAPI;
const backendAPI = process.env.CORBADO_BACKENDAPI;

console.log(projectID)
console.log(apiSecret)
console.log(frontendAPI)
console.log(backendAPI)
const config = new Config(projectID, apiSecret, frontendAPI, backendAPI);
const sdk = new SDK(config);

export const authenticateCorbado = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader);
    if (authHeader) {
        const shortTermSessionValue = authHeader.split(' ')[1];
        console.log(shortTermSessionValue);
        try {
            const user = await sdk.sessions().validateToken(shortTermSessionValue);
            console.log(`User with ID ${user.userId()} is authenticated!`);
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