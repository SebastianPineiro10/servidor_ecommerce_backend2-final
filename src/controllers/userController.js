import UserRepository from '../repositories/user.repository.js';
import UserDTO from '../dto/user.dto.js';

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.session?.user) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const user = await UserRepository.getUserById(req.session.user._id);
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const userData = new UserDTO(user);
        return res.status(200).json({ user: userData });
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};
