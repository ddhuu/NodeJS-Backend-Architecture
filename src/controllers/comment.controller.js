"use strict";
const { SuccessResponse } = require("../core/success.response");

const CommentService = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new Comment",
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: "Get List of Comment Successfully ",
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete Comment successfully",
      metadata: await CommentService.deleteComment(req.body),
    }).send(res);
  };
}

module.exports = new CommentController();
