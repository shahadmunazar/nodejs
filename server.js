const http = require("http");
const app = require("./app"); // Adjust the path based on your folder structure

const port = 3000;

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
