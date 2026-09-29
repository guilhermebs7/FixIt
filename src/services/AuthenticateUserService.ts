import { prisma } from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface IAuthenticateRequest{
    email: string;
    password: string;
}

interface IAuthenticateResponse{
    user:{
        id: string;
        nome: string;
        email: string;
        role: string;
    };
    token: string;
}
export class AuthenticateUserService{
    async execute({email, password}: IAuthenticateRequest): Promise<IAuthenticateResponse>{
        const user = await prisma.user.findUnique({
            where: {email},
        });
        if(!user){
            throw new Error('Email ou senha incorretos.')
        }

        const passwordMatch= await bcrypt.compare(password, user.password); //compara a senha enviada com o hash salvo no banco

        if(!passwordMatch){
            throw new Error('Email ou senha incorretas.')
        }
        const secret = process.env.JWT_SECRET ;   //gerar o token JWT
        if(!secret){
            throw new Error('JWT_SECRET não configurado')
        }

        const token = jwt.sign(
            {
                role: user.role },
                secret,
                {
                 subject: user.id,
                 expiresIn: '1d'   ,  //expira em 1 dia
                }
        );
        return {
            user:{
                id:user.id,
                nome: user.nome,
                email: user.email,
                role: user.role,
            },
            token,
        };
    }
}
