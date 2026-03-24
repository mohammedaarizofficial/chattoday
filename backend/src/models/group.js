import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        members: {
            type: [String],
            default: []
        },
        createdBy: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
