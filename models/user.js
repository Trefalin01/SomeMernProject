//Create model 
//Connect with database and got options: Schema, model, Types

const { Schema, model, Types } = require('mongoose');

//Create schema. Schema construct
const schema = new Schema({
    email: { type: String, requred: true, unique: true },
    password: { type: String, require: true },
    links: [{ type: Types.ObjectId, ref: 'Link' }]
})

//export from file, our model with schema 

module.exports = model('User', schema);