import App from "./app";

const PORT = Number(process.env.PORT) || 5000;

const server = new App(PORT);
server.listen();