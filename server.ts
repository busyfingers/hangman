import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile } from "fs";
import { join, extname } from "path";

const PORT = 3000;

// Define a function to handle requests
const requestHandler = (req: IncomingMessage, res: ServerResponse): void => {
  // Determine the file path based on the request URL
  let filePath = "." + (req.url || "/");
  if (filePath === "./") filePath = "./public/index.html"; // Default to index.html

  // Set the content type based on the file extension
  const extnameString = String(extname(filePath)).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".wav": "audio/wav",
    ".mp4": "video/mp4",
    ".woff": "application/font-woff",
    ".ttf": "application/font-ttf",
    ".eot": "application/vnd.ms-fontobject",
    ".otf": "application/font-otf",
    ".wasm": "application/wasm",
  };

  const contentType = mimeTypes[extnameString] || "application/octet-stream";

  // Read and serve the requested file
  readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        readFile("./public/404.html", (err, notFoundContent) => {
          res.writeHead(404, { "Content-Type": "text/html" });
          res.end(notFoundContent, "utf-8");
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content, "utf-8");
    }
  });
};

// Create and start the server
const server = createServer(requestHandler);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
