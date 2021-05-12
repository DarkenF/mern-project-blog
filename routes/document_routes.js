const {Router} = require('express')
const Topic = require('../models/Topic')
const Section = require('../models/Section')
const auth = require('../middleware/auth.middleware')
const router = Router()


// api/document/modify
router.post('/modify', auth, async (req, res) => {
   try {
      const { titleToChange, subTitleToChange, modifyTitle, modifySubTitle, modifyDescription } = req.body


      const existingTopic = await Topic.find({title: titleToChange})
      const existingSection = await Section.findOne({subTitle: subTitleToChange})

      // Удаление топика со статьями
      if (!modifyTitle) {
         let existing = {}

         await Topic.findOneAndDelete({title: titleToChange})

         while (existing) {
            existing = await Section.findOne({subTitle: subTitleToChange})
            await Section.findOneAndDelete({subTitle: subTitleToChange})
         }

         return res.status(201).json({ message: 'Данные удалены'})
      }

      if (modifyTitle && !modifySubTitle) {
         await Section.findOneAndDelete({subTitle: subTitleToChange})

         return res.status(201).json({ message: 'Данные удалены'})
      }

      if (existingTopic && existingSection) {
         if (titleToChange !== modifyTitle) {
            await Topic.findOneAndUpdate({title: titleToChange}, {title: modifyTitle})

            return res.status(201).json({ message: 'Данные изменены'})

         }
         if (subTitleToChange !== modifySubTitle || existingSection.description !== modifyDescription) {
            await Section.findOneAndUpdate({subTitle: subTitleToChange}, {subTitle: modifySubTitle, description: modifyDescription})

            return res.status(201).json({ message: 'Данные изменены'})

         }
      }

   }catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так!'})
   }
})

// api/document/generate
router.post('/generate', auth, async (req, res) => {
   try {
      const { title, subTitle, description } = req.body


      const existingTopic = await Topic.findOne({title})
      const existingSection = await Section.findOne({subTitle})

      if (existingTopic && existingSection) {
         return res.json({article: {
               topic: existingTopic,
               section: existingSection,
            }})
      }

      if (existingTopic && !existingSection) {

         const section = new Section({
            subTitle, description, ownerTopic: existingTopic._id
         })
         await section.save()

         return res.status(201).json({article: {
               section,
            }})
      }


      const topic = new Topic({
         title,
      })
      const section = new Section({
         subTitle, description, ownerTopic: topic._id
      })

      await topic.save()
      await section.save()

      res.status(201).json({article: {
            topic,
            section,
         }})
   }catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так!'})
   }
})

// api/document/
router.get('/', auth, async (req, res) => {
   try {
      const topics = await Topic.find()

      for (let i = 0; i < topics.length; i++) {
         const existingSection = await Section.find({ownerTopic:topics[i]._id})

         if (existingSection) {
            topics[i].description = existingSection
         }

      }
      res.json(topics)
   }catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так!'})
   }
})
// /api/document/:id
router.get('/:id', auth, async (req, res) => {
   try {
      const sections = await Section.findById(req.params.id) // ????
      res.json(sections)
   }catch (e) {
      res.status(500).json({ message: 'Что-то пошло не так!'})
   }
})

module.exports = router;
