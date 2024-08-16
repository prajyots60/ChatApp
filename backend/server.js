// const express = require('express');
// const dotenv = require('dotenv');
import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/message.routes.js';
import userRoutes from './routes/user.routes.js';

import connectToMongoDB from './db/connectToMongoDB.js';

import {app, server} from './socket/socket.js';

//variables



dotenv.config();

const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();



//middleware
app.use(express.json());  //parse json data from req.body
app.use(cookieParser());  //parse cookies from the client

//routes

app.use("/api/auth" ,authRoutes);
app.use("/api/messages" ,messageRoutes);
app.use("/api/users" ,userRoutes);

//serve static assets in production
app.use(express.static(path.join(__dirname, '/frontend/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/frontend/dist/index.html'));
});

//listen 
server.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server running on port ${PORT}`);
});