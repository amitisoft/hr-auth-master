import {Callback, Context} from "aws-lambda";
import * as Jwt from 'jsonwebtoken';
import * as request from 'request';


export class ApiAuthorizer {

    private secret: string;

    constructor() {
        this.secret = process.env.ACCESS_TOKEN_SECRET || '';
    }

    private generatePolicy(principalId: string, effect: string, resource: any) {
        const authResponse:any = {};
        authResponse.principalId = principalId;
        if (effect && resource) {
            const policyDocument:any = {};
            policyDocument.Version = '2012-10-17';
            policyDocument.Statement = [];
            const statementOne:any = {};
            statementOne.Action = 'execute-api:Invoke';
            statementOne.Effect = effect;
            statementOne.Resource = resource;
            policyDocument.Statement[0] = statementOne;
            authResponse.policyDocument = policyDocument;
        }
        return authResponse;
    }

    private findTokenInfo(token: string, lambdaEvent: any, tokenInformation: any, callback: Callback): void {
        let body = {
            'id_token': token
        };

        var options = {
            url: 'https://'+ process.env.DOMAIN + '/tokeninfo',
            method: 'POST',
            json: true,
            body: body
        };

        request(options, (error: any, response, body: any): void => {
            if(error && response.statusCode != 200) {
                console.error("error in fetching token info");
                return;
            }

            console.log("response received from token info" + JSON.stringify(body));

            // prepare context
            let authResponse = this.generatePolicy('user', 'Allow', lambdaEvent.methodArn);
            authResponse.context = {};
            authResponse.context.principal = JSON.stringify({
                //userName: tokenInformation.userName
                userName: body.email
            });
            console.info('authorized',authResponse);
            callback(null, authResponse);

        });
    }

    handler = (lambdaEvent: any, context: Context, callback: Callback)  => {

        // LOGIC
        // get Bearer token from event
        // verify token using secret

        if (!lambdaEvent.authorizationToken) {
            callback(null, this.generatePolicy('user', 'Deny', lambdaEvent.methodArn));
            return;
        }

        const token: string = lambdaEvent.authorizationToken.replace('Bearer ', '');
        console.log(`token received ${token}`);

        let tokenInformation = null;
        try {
            tokenInformation = Jwt.verify(token,this.secret)
        }catch(e) {
            console.error('Failed to authorize request',lambdaEvent,e);
            callback(null, this.generatePolicy('user', 'Deny', lambdaEvent.methodArn));
            return;
        }

        this.findTokenInfo(token, lambdaEvent, tokenInformation, callback);

        // // prepare context
        // let authResponse = this.generatePolicy('user', 'Allow', lambdaEvent.methodArn);
        // authResponse.context = {};
        // authResponse.context.principal = JSON.stringify({
        //     userName: tokenInformation.userName
        // });
        // console.info('authorized',authResponse);
        // callback(null, authResponse);


    }

}