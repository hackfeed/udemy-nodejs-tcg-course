const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write(
      "<html>" +
        "<head>" +
        "<title>Submit for users list</title></head>" +
        "<body>" +
        "<h1>Here yo can submit for our flex users list</h1>" +
        "<form action='/create-user' method='POST'><input type='text' name='username'><button type='submit'>Send</button></form>" +
        "</body>" +
        "</html>"
    );
    return res.end();
  }

  if (url === "/users") {
    res.setHeader("Content-Type", "text/html");
    res.write(
      "<html>" +
        "<head>" +
        "<title>Our flex users list</title></head>" +
        "<body>" +
        "<h1>Here yo can see our flex users list</h1>" +
        "<ul><li>mRRvz</li><li>VASYA_VAN</li><li>Justarone</li><li>xGULZAx</li><li>hackfeed</li?></ul>" +
        "</body>" +
        "</html>"
    );
    return res.end();
  }

  if (url === "/create-user" && method === "POST") {
    const body = [];

    req.on("data", chunk => {
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const username = parsedBody.split("=")[1];

      console.log(username);
    });

    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  res.setHeader("Content-Type", "text/html");
  res.write(
    "<html>" +
      "<head><title>How you come here?</title></head>" +
      "<body><h1>O_o</h1></body>" +
      "</html>"
  );
  res.end();
};

exports.handler = requestHandler;
