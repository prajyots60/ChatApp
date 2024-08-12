import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const generateTokenAndSetCookie = (userId , res) => {
   const token = jwt.sign({userId}, process.env.JWT_SECRET, {
       expiresIn: '15d',
   });

   res.cookie('jwt', token, {
        httpOnly:true, //cookie cannot be accessed by client side script
        maxAge: 15 * 24 * 60 * 60 * 1000, //15 days
        sameSite: 'strict',
    });
   
}

export default generateTokenAndSetCookie;