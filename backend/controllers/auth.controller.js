import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import generateTokenAndSetCookie from '../utils/generateToken.js';

export const signup = async (req,res) => {
   try {
    const {fullName, userName,password,confirmPassword,gender}  = req.body;

    if(!fullName || !userName || !password || !confirmPassword || !gender){
        return res.status(400).json({message:"All fields are required"});
    }

    if(password !== confirmPassword) {
        return res.status(400).json({error:"Password doesn't match."})
    }

    const user = await User.findOne({userName});

    if(user){
        return res.status(400).json({error:"userName already exist"})
    }

    //Hashed Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    //Profile Pic avatar

    const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
    const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;

    const newUser = new User({
        fullName,
        userName,
        password:hashedPassword,
        gender,
        profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
    });

    if(newUser){
        //generate JWT 
        generateTokenAndSetCookie(newUser._id, res);
        await newUser.save();
    
        res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            userName:newUser.userName,
            profilePic:newUser.profilePic,
    
        });
    } else {
        res.status(400).json({error:"Invalid User Data"});
    }

   } catch (error) {
         console.log("Error in signup",error.message);
         res.status(500).json({error:"Internal Server Error"});
    
   }
}

export const login = async (req,res) => {
    try {
        const {userName, password} = req.body;

        const user = await User.findOne({userName});

        const isPasswordCorrect = await bcrypt.compare(password , user?.password || "");

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error:"Invalid Credentials"});
        }

        //generate JWT
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            userName:user.userName,
            profilePic:user.profilePic,
        });

    } catch (error) {
        console.log("Error in login",error.message);
        res.status(500).json({error:"Internal Server Error"});
        
    }
}

export const logout = (req,res) => { 
    try {
        res.cookie('jwt', '' , {maxAge: 0});
        res.status(200).json({message:"Logged out Successfully"});
        
    } catch (error) {
        console.log("Error in logout",error.message);
        res.status(500).json({error:"Internal Server Error"});
        
    }
}