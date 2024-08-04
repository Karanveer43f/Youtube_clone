import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content, owner } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Some error occurred while creating tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, tweet, "Tweet created successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet Id is required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Tweet Id is not valid");
  }

  const tweet = await Tweet.findById(tweetId);

  if (tweet?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(404, "only owner can delete their tweet");
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    throw new ApiError(500, "Some error occurred while deleting tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!tweetId) {
      throw new ApiError(400, "Tweet Id is required");
    }
    if (!content) {
      throw new ApiError(400, "Content is required");
    }

    if (!isValidObjectId(tweetId)) {
      throw new ApiError(400, "Tweet Id is not valid");
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }

    const updaterId = req.user?._id;
    if (tweet?.owner.toString() !== updaterId?.toString()) {
      throw new ApiError(404, "Only the owner can update the tweet");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    if (!updatedTweet) {
      throw new ApiError(500, "Failed to edit tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to update tweet", [error]);
  }
});

export { createTweet, deleteTweet, updateTweet };
