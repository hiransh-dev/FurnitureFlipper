const Joi = require("joi");

const joiFurnitureSchema = Joi.object({
  furniture: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required(),
    desc: Joi.string().allow(null, ""),
    imageurl: Joi.string().required(),
    location: Joi.string().allow(null, ""),
    // timestamp: Joi.string().required(),
    // timestamp is commented because the validateJoi middleware funtion in app will be executed before timestamp is added through timeFunc, alternatively i could make it allowed but null
  }).required(),
});

const joiQuestionsSchema = Joi.object({
  questions: Joi.object({
    ques: Joi.string().required(),
    ans: Joi.string().allow(null, ""),
    // timestamp: Joi.string().required(),
    // timestamp is commented because the validateJoi middleware funtion in app will be executed before timestamp is added through timeFunc, alternatively i could make it allowed but null
  }).required(),
});

const joiUserSchema = Joi.object({
  userRegister: Joi.object({
    email: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    pwd: Joi.string().required(),
    // username: Joi.string().allow(null, ""),
    // username is commented because the validateJoi middleware funtion in app will be executed before timestamp is added through timeFunc, alternatively i could make it allowed but null
  }).required(),
});

module.exports = { joiFurnitureSchema, joiQuestionsSchema, joiUserSchema };
