const express = require('express')
const router = express.Router()
const { ensureAuth, ensureGuest } = require('../middleware/auth')
const Story = require('../models/Story')

// Login/LAnding GET
router.get('/', ensureGuest, (req, res) => {
    res.render('login', {
        layout: 'login'
    })
})

// dashboard GET
router.get('/dashboard', ensureAuth, async (req, res) => {
    try {
        // to pass in the data in the template (handlebars) we need to add the method lean
        const stories = await Story.find({ user: req.user.id }).lean()
        res.render('dashboard', {
            name: req.user.firstName,
            stories
        })
    } catch (error) {
        res.render('error/500')
    }
})



module.exports = router;