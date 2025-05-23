import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"invalid videoId")
    }
    const comments = await Comment.aggregate([
        {
            $match:{
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip:(Number(page) -1) * Number(limit)
        },
        {
            $limit:Number(limit)
        },
        {
            $project:{
                content:1,
                owner:1
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
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"comment",
                as:"likes"
            }
        },
        {
            $addFields:{
                owner:{
                    $arrayElemAt: ["$owner", 0] 
                },
                likes:{
                    $size:"$likes"
                }
            }
        },
    ])

    if(!comments){
        throw new ApiError(400, "comments are not fetched")
    }
    return res.status(200).json(
        new ApiResponse(200,comments,"Video comments are fetched successfull")
    )
    

})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content}= req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is incorrect or missing")
    }
    if(!content){
        throw new ApiError(400,"content is missing")
    }
    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user._id
    })
    if(!comment){
        throw new ApiError(400,"comment is not added")
    }
    return res.status(200).json(new ApiResponse(200,comment,"Comment is added successfully"))
    // TODO: add a comment to a video
})

const updateComment = asyncHandler(async (req, res) => {
     const {commentId} = req.params
     const {content}= req.body
     if(!isValidObjectId(commentId)){
        throw new ApiError(400,"commentId is uncorrect or missing")
    }
    if(!content){
        throw new ApiError(400,"content is missing")
    }
    const comment = await Comment.findByIdAndUpdate(  commentId,
        {
       
        content
        },
        {
            new:true,
            runValidators:true

        }
        

    )
    if(!comment){
        throw new ApiError(400, "comment is not updated")
    }  


    return res.status(200).json
    (
        new ApiResponse(200, comment ,"Comment is updated successfull")
    )
        
    

    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }