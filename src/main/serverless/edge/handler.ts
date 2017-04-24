import { ApiAuthorizer } from "./typescript/custom-authorizer/api-authorizer";
import { HRLoginHandler } from './typescript/hr-web-login/hr-login-handler';

class AppContext {

}

let appContext: AppContext = new AppContext();

exports.authorize = new ApiAuthorizer().handler;
