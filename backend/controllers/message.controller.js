import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId } from "../socket/socket.js";
import { io } from "../socket/socket.js";

export const sendMessages = async (req,res) => {
    try {
      const {message} = req.body;
      const {id: receiverId} = req.params;
      const senderId = req.user._id;

      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      })

      if(!conversation){
        conversation = await Conversation({
          participants: [senderId, receiverId],
        });
      }

      const newMessage = new Message ({
        senderId,
        receiverId,
        message,
      })

   

      if(newMessage){
        conversation.messages.push(newMessage._id);
      }

      // takes longer time
      // await conversation.save();
      // await newMessage.save();

      // runs parallely
      await Promise.all([conversation.save(), newMessage.save()]);


      

      // socket io here

      const receiverSocketId = getReceiverSocketId(receiverId);
      if(receiverSocketId){

        //io.to()<>.emit()  is used to send events to a specific client or group of clients
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }




      res.status(201).json(newMessage);



     
      
    } catch (error) {
        console.log("Error in sending message",error.message);
        res.status(500).json({error:"Internal Server Error"});
      
    }
};

export const getMessages = async (req,res) => {
    try {
      const {id: userToChatId} = req.params;
      const senderId = req.user._id;

      const conversation = await Conversation.findOne({
        participants: {$all: [senderId, userToChatId]},
      }).populate("messages");

      if(!conversation){
        return res.status(200).json([]);
      }

      const messages = conversation.messages;

      res.status(200).json(messages);


    } catch (error) {
        console.log("Error in getting messages",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}