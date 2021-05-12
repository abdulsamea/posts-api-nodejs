
var express = require("express");
var app = express();
const axios = require('axios');
var mcache = require('memory-cache');


// enable caching for non-test environments.
process.env.ENABLE_CACHE = 'yes';

var cache = (duration) => {
//    cache middleware for caching express.js data
    return (req, res, next) => {
        if (process.env.ENABLE_CACHE == 'yes') {
        let key = '__express__'+req.originalUrl || req.url 
        let cachedBody = mcache.get(key)
        if(cachedBody){
            res.send(cachedBody)
            return
        }
        else{
            res.sendResponse = res.send
            res.send = (body) => {
                mcache.put(key, body, duration * 1000)
                res.sendResponse(body)
            }
            next()
        }
    }
    else{
        next()
    }
    }
   
}

app.get("/api/ping", cache(60), (req, res, next) => {
    res.json( { "success": true } );
});


app.get("/api/posts", cache(60), (req, res, next) => {

    var tagQuery = req.query.tags;
    var sortQuery = req.query.sortBy;
    var directionQuery = req.query.direction;
    var validSorts = ['id', 'reads', 'likes', 'popularity']
    var validDirection = ['desc', 'asc']
    
    // check if tag parameter is not passed in url
    if(!tagQuery) {
        res.status(400).send({error: "Tags parameter is required"});
    }

    // check for invalid sort query
    if(sortQuery != undefined && !validSorts.includes(sortQuery) ) {
        res.status(400).send({error: "sortBy parameter is invalid"});
    }

    // check for invalid direction query
    if(directionQuery != undefined && !validDirection.includes(directionQuery) ) {
        res.status(400).send({error: "direction parameter is invalid"});
    }

    // seperete tags from query into an array ( ...tag=health,politics => [health, politics] ) 
    var seperatedTags = tagQuery.split(',');
    
    // call generic posts method to get all posts based on queries 
    getAllPosts(seperatedTags, sortQuery, directionQuery, validSorts, validDirection)
    .then(result => {
        res.send({ posts: result })
    })

});

let getAllPosts = async (seperatedTags, sortQuery, directionQuery, validSorts, validDirection) => {
        
    return new Promise ((resolve, reject) => {
    result = []
    promises = []
    // for each tag, [perform] an axios fetch.
    seperatedTags.forEach(tag => {
        var queryForPosts = '?tag='+tag

        // append sortBu query if present.
        if(sortQuery){
            queryForPosts += '&sortBy='+sortQuery
        }
        
        // append direction query if present.
        if(directionQuery){
            queryForPosts += '&direction='+directionQuery
        }
    
        try {
            promises.push(
                // fetch json from hatchways 
                axios.get('https://api.hatchways.io/assessment/blog/posts'+queryForPosts)
                .then(res => {
                   res.data.posts.forEach(post => {
                       result.push(post)
                   });
                })
            )
        } 
        catch (error) {
            reject(error)
        }
    })

   // Promise.all to asyncly complete all requests for each tags 
    Promise.all(promises).then(() => { 
        // remove duplicates and send result 
        result = result.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);

        //sort based on property if direction is descending
        if (directionQuery != undefined && directionQuery == 'desc'){
            result.sort((a, b) => (a[sortQuery] < b[sortQuery]) ? 1 : -1);
        }

        //sort based on property if direction is ascending
        if (directionQuery != undefined && directionQuery == 'asc'){
            result.sort((a, b) => (a[sortQuery] > b[sortQuery]) ? 1 : -1)
        }

        // return result if all is good! 
        resolve(result) 
    });
})

}


// export app to be so it can be used in other modules (eg: testing)
module.exports = app

// start server
app.listen(3000, () => {
 console.log("Server running on port 3000");
});