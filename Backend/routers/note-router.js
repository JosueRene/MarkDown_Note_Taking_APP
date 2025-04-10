const router = require('express').Router()
const Note = require('../models/note-model')
const multer = require('multer')
const MarkdownIt = require('markdown-it')
const axios = require('axios')
const fs = require('fs')
const upload = require('../utilis/upload')

const md = new MarkdownIt()

// Upload a Markdown file
router.route('/upload').post(upload.single('file'), async(req, res)=> {
    const file = req.file

    if(!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const content = await fs.promises.readFile(file.path, 'utf-8');
    const note = new Note({
        title: file.originalname.replace('.md', ''),
        content
    })

    await note.save()
    return res.status(201).json({message: 'Note uploaded successfully!', note})
    

})

// Check Grammar for a markdown note
router.post('/check-grammar', async(req, res)=> {
    const { text } = req.body

    if(!text) {
        return res.status(400).json({error: "Text is required for grammar checking." })
    }

    try{

        // Null means no body needed
        const response = await axios.post('https://api.languagetool.org/v2/check', null, {params: {text, language: 'en-US'}}) //Usually, we write {params: {text: text, language: 'en-US'}} But we wrote one 'text' because they're similar

        const grammarIssues = response.data.matches.map(match => ({
            message: match.message,
            suggestions: match.replacements.map(r => r.value),
            context: match.context.text
        }))

        res.status(200).json({issues: grammarIssues})
        
    } catch (error) {
        console.error('Error checking grammar:', error)
        res.status(500).json({error: "Failed to check grammar. Please try again!"})
    }
})

//List all saved Notes
router.get('/', async(req, res) => {
    const notes = await Note.find().select('_id title createdAt')
    res.status(200).json(notes)
})



// Render a specific Markdown note as HTML
router.get('/:id', async(req, res) => {
    const { id } = req.params

    try {
        
        const note = await Note.findById(id)

        if(!note) {
            return res.status(404).send('<h1> Note not found! </h1>')
        }

        /* The below line takes the Markdown text stored in note.content and converts it into HTML. 
         * Otherwise, You’d be sending the raw Markdown to the browser, which would not be
         * rendered correctly 
         * ex:  # This is a heading
                **Bold text**)
        */

        const renderedHtml = md.render(note.content)

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head><title>${note.title}</title></head>
            <body>${renderedHtml}</body>
            </html>
        `)

    } catch (error) {
        console.error('Error rendering note:', error);
        res.status(500).send('<h1>Failed to render note</h1>');
    }
})

module.exports = router