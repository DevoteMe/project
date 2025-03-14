import Joi from "joi"

export const webhookValidation = {
  stripeWebhook: Joi.object({
    id: Joi.string().required(),
    object: Joi.string().required(),
    type: Joi.string().required(),
    data: Joi.object().required(),
    created: Joi.number().required(),
  }),

  paypalWebhook: Joi.object({
    id: Joi.string().required(),
    event_type: Joi.string().required(),
    resource: Joi.object().required(),
    create_time: Joi.string().required(),
  }),

  mailchimpWebhook: Joi.object({
    type: Joi.string().required(),
    data: Joi.object().required(),
  }),

  cloudinaryWebhook: Joi.object({
    notification_type: Joi.string().required(),
    resource_type: Joi.string().required(),
    public_id: Joi.string().required(),
  }),
}

