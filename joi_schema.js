const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

// GOT DIRECTLY FROM SOURCE
const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const Joi = BaseJoi.extend(extension);

const joiFurnitureSchema = Joi.object({
  furniture: Joi.object({
    title: Joi.string().min(1).max(30).required().escapeHTML(),
    price: Joi.number().min(1).max(9999).positive().precision(2).required(),
    desc: Joi.string().min(1).max(100).allow(null, "").escapeHTML(),
    // imageurl: Joi.string().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    // timestamp: Joi.string().required(),
    // timestamp is commented because the validateJoi middleware funtion in app will be executed before timestamp is added through timeFunc, alternatively i could make it allowed but null
  }).required(),
});

const joiQuestionsSchema = Joi.object({
  questions: Joi.object({
    ques: Joi.string().min(1).max(60).required().escapeHTML(),
    ans: Joi.string().min(1).max(60).allow(null, "").escapeHTML(),
    // timestamp: Joi.string().required(),
    // timestamp is commented because the validateJoi middleware funtion in app will be executed before timestamp is added through timeFunc, alternatively i could make it allowed but null
  }).required(),
});

const joiUserSchema = Joi.object({
  userRegister: Joi.object({
    email: Joi.string().min(4).max(25).email().required().escapeHTML(),
    firstName: Joi.string().min(1).max(25).required().escapeHTML(),
    lastName: Joi.string().min(1).max(25).required().escapeHTML(),
    pwd: Joi.string().required().escapeHTML(),
    // username: Joi.string().allow(null, ""),
    // username is commented because the validateJoi middleware funtion in app will be executed before timestamp is added through timeFunc, alternatively i could make it allowed but null
  }).required(),
});

module.exports = { joiFurnitureSchema, joiQuestionsSchema, joiUserSchema };
