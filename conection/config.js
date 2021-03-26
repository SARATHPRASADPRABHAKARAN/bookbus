const mongoclient=require('mongodb').MongoClient
const state={
    db:null
}
module.exports.conect=function(done){
    const Url='mongodb://localhost:27017'
    const dbname='bookbus'

    mongoclient.connect(Url,{ useUnifiedTopology: true },(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}
module.exports.get=function(){
    return state.db
}