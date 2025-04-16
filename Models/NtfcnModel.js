const mongoose = require('mongoose');
const { Schema } = mongoose; // Add this line


const NtfcnSchema = new mongoose.Schema({
    type : {
        type : String,
        enum : ["Like", "comment", "reply"],
        require : true
    },
    blog : {
        type : Schema.Types.ObjectId,
        required : true,
        ref : 'Blog'
    },
    ntfcn_for : {
        type : Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    user : {
        type : Schema.Types.ObjectId,
        required : true,
        ref : 'User'
    },
    comment : {
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    },
    reply : {
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    },
    replied_on_comment : {
        type : Schema.Types.ObjectId,
        ref : 'Comment'
    },
    seen : {
        type : Boolean,
        default : false
    }
}, {timestamps : true})

const ntfcnModel = mongoose.model("notification", NtfcnSchema);

module.exports = ntfcnModel;