import { messageRepository, groupRepository } from '../repositories';
import { ResponseHandler } from '../helper';

export default class MessageController {
  static async getAll(req, res, next) {
    try {
  
      const options = {
        populate: [
          {
            path: 'author',
            select: '-password',
          },
          {
            path: 'group'
          }
        ],
        lean: true
      };
  
      const messages = await messageRepository.getAll(options);
  
      if (!messages.length) { return next(new Error('Messages not found!')) };
  
      return ResponseHandler.returnSuccess(res, messages);
  
    } catch (err) {
      return next(err);
    }
  };

  static async get(req, res, next) {
    try {
  
      const options = {
        where: { _id: req.params.id },
        populate: [
          {
            path: 'author',
            select: '-password'
          },
          {
            path: 'group'
          }
        ],
        lean: true
      };
      const message = await messageRepository.get(options);
      if (!message) {
        return next(new Error('Message not found!'));
      }
      return ResponseHandler.returnSuccess(res, message);
    } catch (err) {
      return next(err);
    };
  };

  static async create(req, res, next) {
    try {
      const author = req.user._id;
      const { messages, group } = req.body;
      const member = await groupRepository.get({ //check the user is exist in this group ??
        where: {
          _id: group,
          members: author
        }
      });
      if (!member) {
        return next(new Error('You is not exist in this group!'));
      }
  
      const message = messageRepository.create({ author, messages, group });
      await message.save();
  
      return ResponseHandler.returnSuccess(res, message);
    } catch (err) {
      return next(err);
    }
  };

  static async update(req, res, next) {
    try {
  
      const options = {
        where: { 
          _id: req.params.id,
          author: req.user._id //check the message is created by this user
        },
        data: { $set: req.body },
        lean: true
      };
      const message = await messageRepository.findOneAndUpdate(options);
  
      if (!message) {
        return next(new Error('Message not found!'));
      }
  
      return ResponseHandler.returnSuccess(res, { message: { ...message, ...req.body } });
  
    } catch (err) {
      return next(err);
    }
  };
  
  static async delete(req, res, next) {
    try {
      const options = {
        where: {
          _id: req.params.id,
          author: req.user._id
        },
        data: { $set: { deletedAt: new Date() } },
        lean: true
      }
      const message = await messageRepository.findOneAndUpdate(options);
      if (!message) {
        return next(new Error('Message not found!'))
      }
      return ResponseHandler.returnSuccess(res, { message: 'Deleted message successly!' });
    } catch (err) {
      return next(err);
    }
  };
}
