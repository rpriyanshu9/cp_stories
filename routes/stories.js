const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Story = require('../models/Story')

// Show add page GET
router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

// process add form POST
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id;
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
})

// Show All Stories GET
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ status: 'public' }).populate('user').sort({ createdAt: 'desc' }).lean()
        res.render('stories/index', {
            stories
        })
    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
})

// Show Single Story GET
router.get('/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).populate('user').lean()

        if (!story) {
            return res.render('error/404')
        }

        res.render('stories/show', {
            story
        })

    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
})


// Show Single Story GET
router.get('/user/:userId', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({ user: req.params.userId, status: 'public' }).populate('user').lean()

        res.render('stories/index', {
            stories
        })

    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
})

// Show edit page GET
router.get('/edit/:id', ensureAuth, async (req, res) => {

    try {
        const story = await Story.findOne({ _id: req.params.id }).lean()

        if (!story) {
            res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story
            })
        }
    } catch (error) {
        console.log(error);
        res.render('error/500')
    }


})

// Update story PUT
router.put('/:id', ensureAuth, async (req, res) => {

    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            res.render('error/404')
        }

        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true, })
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.log(error);
        res.render('error/500')
    }


})

// Delete story DELETE
router.delete('/:id', ensureAuth, async (req, res) => {

    try {
        await Story.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.log(error);
        res.render('error/500')
    }
})

module.exports = router;