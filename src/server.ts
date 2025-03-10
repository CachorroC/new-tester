import http from 'http';

const hostname = '192.168.68.101';

const port = 3000;

const server = http.createServer(
  (
    req, res 
  ) => {
    res.statusCode = 200;
    res.setHeader(
      'Content-Type', 'text/plain' 
    );
    res.end(
      'Hello, World!\n' 
    );
  } 
);

server.listen(
  port, hostname, () => {
    console.log(
      `Server running at http://${ hostname }:${ port }/` 
    );
  } 
);
