import mongoose from "mongoose";
import express from "express";
import dotenv from 'dotenv';

const connectdb = async()=>{
    try{
        mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB is connected`);
    }catch(error){
        console.log(`Unable to connect to DB cause of ${error}`);
    }
}

export default connectdb;

