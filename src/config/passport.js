import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/user.model.js';

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.token]),
  secretOrKey: process.env.JWT_SECRET,  // Usar variable de entorno para la clave secreta
};

passport.use(
  new JwtStrategy(options, async (jwt_payload, done) => {
    try {
      const user = await User.findById(jwt_payload.id);
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      return done(null, user);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return done(null, false, { message: 'Token expirado' });
      }
      return done(error, false);
    }
  })
);

export default passport;
