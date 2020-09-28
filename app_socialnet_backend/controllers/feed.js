exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "Amazing post",
        content: "Amazing content",
        imageUrl: "images/img.jpg",
        creator: {
          name: "hackfeed",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.postPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: {
        name: "hackfeed",
      },
      createdAt: new Date(),
    },
  });
};
