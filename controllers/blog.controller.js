function blogs(req, res) {
  const posts = "This is for Blogs testing";
  res.send(posts);
}

module.exports = {
  blogs,
};
