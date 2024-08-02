function blogs(req, res) {
  const posts = "This is for Blogs testings";
  res.send(posts);
}

module.exports = {
  blogs: blogs,
};
