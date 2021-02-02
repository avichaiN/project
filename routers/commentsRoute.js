const express = require("express");
const router = express.Router();
const Comment = require("../models/comment");
const Post = require("../models/post");
const checkUserToken = require("./gFunctions/checkUserToken");

const commentsController = require("../controllers/commentsController")

router
  .route("/")
  .post(checkUserToken, commentsController.createComment)
  .delete(checkUserToken, commentsController.deleteComment)

router
  .route("/:id")
  .get(checkUserToken, commentsController.getPostsComments)

  router
  .route("/like")
  .get(checkUserToken, commentsController.addLike)
  .delete(checkUserToken, commentsController.deleteLike)

  router
  .route("/likedAmount")
  .post(checkUserToken, commentsController.checkHowMuchLiked)

  router
  .route("/length")
  .post(checkUserToken, commentsController.checkHowMuchComments)

  router
  .route("/user/like/check")
  .post(checkUserToken, commentsController.checkIfUserLiked)


module.exports = router