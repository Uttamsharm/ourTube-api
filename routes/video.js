const express= require('express')
const checkAuth = require('../middleware/checkAuth')
const Router= express.Router()
const jwt= require('jsonwebtoken')
const cloudinary = require('cloudinary').v2;
const Video= require('../models/Video')
const mongoose= require('mongoose')



cloudinary.config({ 
   cloud_name: 'dkjxkwlru', 
   api_key: '427787522488678', 
   api_secret: '4CPDc9AB0cJfwRUJjiiwh5qs2wo' 
}); 

 Router.post('/upload' ,checkAuth,async(req,res)=>{
    try{
        const token = req.headers.authorization.split(" ")[1] 
       const user= await jwt.verify(token, 'Uttam Sharma 123')
      const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath)
      const uploadedThumbnail= await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
      console.log(uploadedVideo)
      console.log(uploadedThumbnail)

      const newVideo= new Video({
         _id: new mongoose.Types.ObjectId,
         title:req.body.title,
         description: req.body.description,
         user_id: user._id,
         videoUrl:uploadedVideo.secure_url,
         videoId:uploadedVideo.public_id,
         thumbnailUrl:uploadedThumbnail.secure_url,
         thumbnailId:uploadedThumbnail.public_id,
         category:req.body.category,
         tags:req.body.tags.split(","), 
        
      })
        const newUploadedVideoData = await newVideo.save()
        res.status(200).json({
         newVideo:newUploadedVideoData
        })
    }
    catch(err)
    {
      console.log(err)
      res.status(500).json({
         error:err
      })
    }
 })

 // update video detail
 Router.put('/:videoId',checkAuth,async(req,res)=>{
   try
   {
         const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1] ,'Uttam Sharma 123')
         const video= await Video.findById(req.params.videoId)
         if(video.user_id== verifiedUser._id)
         {
            //update video detail
            if(req.files)
            {
               //update thumbnail and text data
              await  cloudinary.uploader.destroy(video.thumbnailId)
            const uploadedThumbnail=  await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
            const updatedData= {
               title:req.body.title,
               description: req.body.description,
               category:req.body.category,
               tags:req.body.tags.split(","), 
               thumbnailUrl:uploadedThumbnail.secure_url,
               thumbnailId:uploadedThumbnail.public_id,
                
            }
             const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true})
             res.status(200).json({
                updatedVideo:updatedVideoDetail
             })
            }
            else{
               const updatedData= {
                  title:req.body.title,
                  description: req.body.description,
                  category:req.body.category,
                  tags:req.body.tags.split(","), 
                   
               }
                const updatedVideoDetail = await Video.findByIdAndUpdate(req.params.videoId,updatedData,{new:true})
                res.status(200).json({
                   updatedVideo:updatedVideoDetail
                })
            }
         }
         else
         {
            return res.status(500).json({
               error:'You have no permission'
            })
         }
   }
   catch(err)
   {
         console.log(err);
         res.status(500).json({
            error:err
         })
   }
 })

 // delete api
  Router.delete('/:videoId',checkAuth,async(req,res)=>{
           try
           {
            const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1] ,'Uttam Sharma 123')
            console.log(verifiedUser)
             const video= await Video.findById(req.params.videoId)
             if(video.user_id == verifiedUser._id){
                //delete video , thumbnail and data from database
                 await cloudinary.uploader.destroy(video.videoId,{resource_type:'video'})
                 await cloudinary.uploader.destroy(video.thumbnailId)
                const deletedResponse= await Video.findByIdAndDelete(req.params.videoId)
                res.status(200).json({
                  deletedResponse:deletedResponse
                })

             }
             else{
               return res.status(500).json({
                  error:'aapki aukaat se bahar hai'
               })
             }
           }
           catch(err){
             console.log(err)
             res.status(500).json({
               error:err
             })
           }
  })

  //like api
   Router.put('/like/:videoId',checkAuth,async(req,res)=>{
      try{
         const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1] ,'Uttam Sharma 123')
         console.log(verifiedUser)
          const video= await Video.findById(req.params.videoId)
          console.log(video)
          if(video.likedBy.includes(verifiedUser._id))
          {
            return res.status(500).json({
               error:'already liked'
            })
          }

          if(video.dislikedBy.includes(verifiedUser._id))
            {
                  video.dislike -=1;
                  video.dislikedBy= video.dislikedBy.filter(userId=>userId.toString() != verifiedUser._id)
            }

          video.likes +=1;
          video.likedBy.push(verifiedUser._id)
          await video.save();
          res.status(200).json({
            msg:'liked'
          })
           
      }
      catch(err){
         console.log(err)
         res.status(500).json({
            error:err
         })
      }
   })

   // dislike
   Router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
      try{
         const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1] ,'Uttam Sharma 123')
         console.log(verifiedUser)
          const video= await Video.findById(req.params.videoId)
          console.log(video)
          if(video.dislikedBy.includes(verifiedUser._id))
          {
            return res.status(500).json({
               error:'already disliked'
            })
          }
          if(video.likedBy.includes(verifiedUser._id))
          {
                video.likes -=1;
                video.likedBy= video.likedBy.filter(userId=>userId.toString() != verifiedUser._id)
          }
          video.dislike +=1;
          video.dislikedBy.push(verifiedUser._id)
          await video.save();
          res.status(200).json({
            msg:'disliked'
          })
           
      }
      catch(err){
         console.log(err)
         res.status(500).json({
            error:err
         })
      }
   })
   // views api
   Router.put('/views/:videoId',async(req,res)=>{
      try
      {
               const video = await Video.findById(req.params.videoId)
               console.log(video)
                video.views +=1;
                await video.save();
                res.status(200).json({
                  msg:'ok'
                })
      }
      catch(err)
      {
         console.log(err)
         res.status(500).json({
            error:err
         })
      }
   })

module.exports = Router  