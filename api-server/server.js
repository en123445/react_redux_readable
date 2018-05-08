require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const config = require('./config')
const categories = require('./categories')
const posts = require('./posts')
const comments = require('./comments')

const app = express()

const ALLOWED_ORIGINS = [
    'http://localhost:3000'
  ]

app.use(express.static('public'))
app.use(cors())


app.get('/', (req, res) => {
    const help = `
  <pre>
    欢迎来到 Udacity Readable API!

    使用**Authorization header**来处理你的数据：

    fetch(url, { headers: { 'Authorization': 'whatever-you-want' }})

    有以下端点可用:

    GET /categories
      USAGE: 
        获取应用程序的所有类别。列表可在 'categories.js' 找到。 
        你可以随意添加或扩展这个列表。
    
    GET /:category/posts
      USAGE:
        获取特定类别的所有帖子。

    GET /posts
      USAGE:
        获取所有帖子。 当没有选择类别时，对主页有用。
    
    POST /posts
      USAGE:
        新添一个帖子。
      
      PARAMS: 
        id - UUID就好, 但任何唯一的ID也都可行。
        timestamp - 可以以任何你喜欢的格式，你也可以使用 'Date.now()' 。
        title - String
        body - String
        author - String
        category: 所有类别均列在 'categories.js'。你可以随意添加或扩展这个列表。

    GET /posts/:id
      USAGE:
        获取单个帖子的详细信息。

    POST /posts/:id
      USAGE:
        用于在帖子中投票。
      PARAMS:
        option - String: '"upVote"' 或 '"downVote"'
        
    PUT /posts/:id
      USAGE:
        编辑现有帖子中的详细信息
      PARAMS:
        title - String
        body - String

    DELETE /posts/:id
      USAGE:
		将帖子的已删除标志设置为“true”。 
		将所有子注释的 parentDeleted 标志设置为“true”。
      
    GET /posts/:id/comments
      USAGE:
        获取单个帖子的所有评论。
    
    POST /comments
      USAGE:
        在帖子中添加评论

      PARAMS:
        id: 任何唯一的ID。 与帖子一样，UUID可能是最好的。
        timestamp: timestamp.
        body: String
        author: String
        parentId: 需要匹配到数据库中的帖子 ID

    GET /comments/:id
      USAGE:
        获取单个评论的详细信息。

    POST /comments/:id
      USAGE:
        用于投票评论。

    PUT /comments/:id
      USAGE:
        编辑现有评论的详细信息。
     
      PARAMS:
        timestamp: timestamp. 时间戳
        body: String

    DELETE /comments/:id
      USAGE:
        将评论的已删除标志设置为'true'.
 </pre>
  `

    res.send(help)
})

app.use((req, res, next) => {
    const token = req.get('Authorization')

    if (token) {
        req.token = token
        next()
    } else {
        res.status(403).send({
            error: 'Please provide an Authorization header to identify yourself (can be whatever you want)'
        })
    }
})


app.get('/categories', (req, res) => {
    categories.getAll(req.token)
        .then(
            res.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS),
            res.set('Access-Control-Allow-Credentials', 'true'),
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.get('/:category/posts', (req, res) => {
    posts.getByCategory(req.token, req.params.category)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.get('/posts', (req, res) => {
    posts.getAll(req.token)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.post('/posts', bodyParser.json(), (req, res) => {
    posts.add(req.token, req.body)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.get('/posts/:id', (req, res) => {
    posts.get(req.token, req.params.id)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.delete('/posts/:id', (req, res) => {
    posts.disable(req.token, req.params.id)
        .then(
            (post) => {
                comments.disableByParent(req.token, post)
            })
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.post('/posts/:id', bodyParser.json(), (req, res) => {
    const { option } = req.body
    const id = req.params.id
    posts.vote(req.token, id, option)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.put('/posts/:id', bodyParser.json(), (req, res) => {
    posts.edit(req.token, req.params.id, req.body)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.get('/posts/:id/comments', (req, res) => {
    comments.getByParent(req.token, req.params.id)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.get('/comments/:id', (req, res) => {
    comments.get(req.token, req.params.id)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.put('/comments/:id', bodyParser.json(), (req, res) => {
    comments.edit(req.token, req.params.id, req.body)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.post('/comments', bodyParser.json(), (req, res) => {
    comments.add(req.token, req.body)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.post('/comments/:id', bodyParser.json(), (req, res) => {
    const { option } = req.body
    comments.vote(req.token, req.params.id, option)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.delete('/comments/:id', (req, res) => {
    comments.disable(req.token, req.params.id)
        .then(
            (data) => res.send(data),
            (error) => {
                console.error(error)
                res.status(500).send({
                    error: 'There was an error.'
                })
            }
        )
})

app.listen(config.port, () => {
    console.log('Server listening on port %s, Ctrl+C to stop', config.port)
})
