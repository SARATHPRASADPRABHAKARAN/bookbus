const mongoclient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.conect=function(done){

    const dbname='bookbus'

    mongoclient.connect(process.env.MONGO_CONNECTION_URL,{ useUnifiedTopology: true },(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}
module.exports.get=function(){
    return state.db
}