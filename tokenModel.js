let mongoose = require("mongoose")

let tokenSchema = mongoose.Schema({
    type: {
        type: String,
        default: 'authorized_user'
    },
    client_id: {
        type: String
    },
    client_secret: {
        type: String
    },
    refresh_token: {
        type: String
    },
    isLogIn: {
        type: Boolean,
        default: false
    }
}, { timestamps: true }
)

module.exports = mongoose.model('tokens', tokenSchema)