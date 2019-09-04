import "./polyfill";
import dva from "dva";
import createHistory from "history/createBrowserHistory";
import createLoading from "dva-loading";
import "./index.less";

const middlewares = [];
// if (process.env.NODE_ENV === `development`) {
//   const { logger } = require(`redux-logger`);

//   middlewares.push(logger);
// }

// 1. Initialize
const app = dva({ history: createHistory(), onAction: middlewares });

// 2. Plugins
app.use(createLoading());

// 3. Model
app.model(require("./models/global").default);

// 4. Router
app.router(require("./router").default);

// 5. Start
app.start("#root");

export default app._store; // eslint-disable-line
