const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    nom :{
        type : String , 
        required : true
    },
    prenom :{
        type : String ,
        required :true 
    },
    image : {
        type : String ,
        required : false 
    }

})

module.exports = mongoose.model('stagiaire' , userSchema)