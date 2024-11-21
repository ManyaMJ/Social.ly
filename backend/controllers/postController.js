import User from "../models/userModel.js";
import { Response } from "../utils/response.js"
import Post from "../models/postModel.js" ; 
import cloudinary from "cloudinary" ; 
import { message } from "../utils/message.js";



export const createPost = async (req, res) => {
    try {
        // Parsing body data
        const {image, caption, location} = req.body;
        
        // Checking body data

        if(!caption) {
            return Response(res, 400, false, message.missingFieldsMessage);
        }
        
        // Check image
        if(!image) {
            return Response(res, 400, false, message.imageMissingMessage);
        }
        // Upload image to cloudinary
        let imageUpload = await cloudinary.v2.uploader.upload(image, {
            folder : 'posts'
        })

        let post = await Post.create({
            image : {
                public_id : imageUpload.public_id,
                url : imageUpload.url
            },
            caption,
            location
        })

        post.owner = req.user._id;
        await post.save() ; 

        let user = await User.findById(req.user._id);
        user.posts.unshift(post._id);
        await user.save() ; 

        Response(res,201,true,message.postCreatedMessage , post) ; 
    } catch (error) {
        Response(res, 500, false, error.message);
    }
}