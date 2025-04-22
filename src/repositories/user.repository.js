import User from '../models/user.model.js';

const UserRepository = {
    findByEmail: async (email) => {
        return await User.findOne({ email });
    },
    createUser: async (userData) => {
        return await User.create(userData);
    }
};

export default UserRepository;
