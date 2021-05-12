const app = require('../index')
const supertest = require('supertest')
const request = supertest(app)

// disable caching when each test case is executed
beforeAll(() => {
    process.env = Object.assign(process.env, { ENABLE_CACHE: 'no' });
  });

describe('Test cases for Posts', () => {

    it('should test that posts are fetching from get url /api/posts', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=likes&direction=desc')
        expect(response.statusCode).toBe(200)
        done()
    })

    it('should test that status 400 is seen fetching from get url /api/posts without tags query param', async done => {
        const response = await request.get('/api/posts?sortBy=likes&direction=desc')
        expect(response.statusCode).toBe(400)
        done()
    })

    it('should test that status 400 is seen fetching from get url /api/posts with wrong query param for sortBy', async done => {
        const response = await request.get('/api/posts?sortBy=position&direction=desc')
        expect(response.statusCode).toBe(400)
        done()
    })

    it('should test that status 400 is seen fetching from get url /api/posts with wrong query param for direction', async done => {
        const response = await request.get('/api/posts?sortBy=position&direction=descending')
        expect(response.statusCode).toBe(400)
        done()
    })


    it('should test that posts are unique', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=likes&direction=desc')
        var a = new Set(response.body.posts).size
        expect(a).toBe(response.body.posts.length)
        done()
    })

    it('should test that posts are in sorted order (descending) based on likes', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=likes&direction=desc')
        var isSorted = true

        var likes = 9999999;
        for(var i = 0; i < response.body.posts.length; i++){
            if (response.body.posts[i].likes > likes){
                isSorted = false
            }
            likes = response.body.posts[i].likes;
        }
        expect(isSorted).toBe(true)
        done()
    })

    it('should test that posts are in sorted order (ascending) based on likes', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=likes&direction=asc')
        var isSorted = true

        var likes = -999;
        for(var i = 0; i < response.body.posts.length; i++){
            if (response.body.posts[i].likes < likes){
                isSorted = false
            }
            likes = response.body.posts[i].likes;
        }
        expect(isSorted).toBe(true)
        done()
    })

    it('should test that posts are in sorted order (ascending) based on reads', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=reads&direction=asc')
        var isSorted = true

        var reads = -999;
        for(var i = 0; i < response.body.posts.length; i++){
            if (response.body.posts[i].reads < reads){
                isSorted = false
            }
            reads = response.body.posts[i].reads;
        }
        expect(isSorted).toBe(true)
        done()
    })

    it('should test that posts are in sorted order (descending) based on reads', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=reads&direction=desc')
        var isSorted = true

        var reads = 9999999;
        for(var i = 0; i < response.body.posts.length; i++){
            if (response.body.posts[i].reads > reads){
                isSorted = false
            }
            reads = response.body.posts[i].reads;
        }
        expect(isSorted).toBe(true)
        done()
    })


    it('should test that posts are in sorted order (ascending) based on popularity', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=popularity&direction=asc')
        var isSorted = true

        var popularity = -999;
        for(var i = 0; i < response.body.posts.length; i++){
            if (response.body.posts[i].popularity < popularity){
                isSorted = false
            }
            popularity = response.body.posts[i].popularity;
        }
        expect(isSorted).toBe(true)
        done()
    })


    it('should test that posts are in sorted order (descending) based on id', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=id&direction=desc')
        var isSorted = true

        var id = 9999999;
        for(var i = 0; i < response.body.posts.length; i++){
            if (response.body.posts[i].id > id){
                isSorted = false
            }
            id = response.body.posts[i].id;
        }
        expect(isSorted).toBe(true)
        done()
    })

    it('should test that posts are in sorted order (ascending) based on id', async done => {
        const response = await request.get('/api/posts?tags=history,tech&sortBy=id&direction=asc')
        var isSorted = true

        var id = -99;
        for(var i = 0; i < response.body.posts.length; i++){
            if (response.body.posts[i].id < id){
                isSorted = false
            }
            id = response.body.posts[i].id;
        }
        expect(isSorted).toBe(true)
        done()
    })

  })