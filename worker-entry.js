import http from "http";

import "./src/queues/email/email.worker.js";

const PORT = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.end("Worker running");
  })
  .listen(PORT, () => {
    console.log(`Worker + dummy server running on ${PORT}`);
  });
