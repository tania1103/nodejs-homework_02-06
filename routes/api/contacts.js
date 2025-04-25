const express = require('express');
const Joi = require('joi');
const {
  listContacts,
  getContactById,
  addContact,
  removeContact,
  updateContact,
} = require('../../models/contacts');

const router = express.Router();

// Validation schema for contact
const contactSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'missing required name field',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'missing required email field',
  }),
  phone: Joi.string().required().messages({
    'any.required': 'missing required phone field',
  }),
});

// GET /api/contacts
router.get('/', async (req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (error) {
    next(error);
  }
});

// GET /api/contacts/:contactId
router.get('/:contactId', async (req, res, next) => {
  try {
    const contact = await getContactById(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
});

// POST /api/contacts
router.post('/', async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const newContact = await addContact(req.body);
    res.status(201).json(newContact);
  } catch (error) {
    next(error);
  }
});

// PUT /api/contacts/:contactId
router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const updatedContact = await updateContact(req.params.contactId, req.body);
    if (!updatedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/contacts/:contactId
router.delete('/:contactId', async (req, res, next) => {
  try {
    const removedContact = await removeContact(req.params.contactId);
    if (!removedContact) {
      return res.status(404).json({ message: 'Not found' });
    }
    res.status(200).json({ message: 'contact deleted' });
  } catch (error) {
    next(error);
  }
});



module.exports = router;
