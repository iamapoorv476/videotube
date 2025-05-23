import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"

import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"it is a required field")
    }
    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })
    if(!tweet){
        throw new ApiError(400,"Tweets could not be created")
    }
    return res.status(200).json(new ApiResponse(200,tweet,"tweet created successfully!"))
    //TODO: create tweet
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    const UserTweets  =await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(userId)
            }
        },
        {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"tweet",
            as:"likes"

        }
    },
    {
        $lookup:{
            from:"users",
            localField:"owner",
            foreignField:"_id",
            as:"owner",
            pipeline:[
                {
                    $project:{
                        username:1,
                        avatar:1
                    }
                }
            ]

        }
    },
    {
        $addFields:{
            likes:{
                 $size:"$likes"
            },
            owner:{
                $first:"$owner"
            }
        }
    }
    ])
    //console.log(UserTweets);
    if(userTweets.length == 0){
        return res.status(200).json(
         new ApiResponse(200,"the user could not tweet yet..")
        )
     }
 
     
 
     return res.status(200).json(
         new ApiResponse(200, userTweets,"the user tweet fetched successfull")
     )
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    const{content} = req.body
    const{tweetId} = req.params
    if(!content){
        throw new ApiError(400,"content is a required field")
    }
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweetId")
    }
    const updateTweet = await Tweet.findByIdAndUpdate( tweetId,
        {
       
        
        $set:{
            content
        }
    },
    {
        new:true
    }
)
if(!updateTweet){
    throw new ApiError(400,"tweet was not updated")
}

return res.status(200).json(new ApiResponse(200,updateTweet,"tweet updated successfully"))

    
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} =req.params

    await Tweet.findByIdAndDelete(tweetId)
    return res.status(200).json(
        new ApiResponse(200,"The tweet is deleted successfull"))
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}