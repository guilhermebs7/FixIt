import { prisma } from '../config/prisma.js';
import { User, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

export type UserResponse = Omit<User, 'password'>; // tipo customizado para omitir a senha no retorno da API
//userResponse representa um usuario sem senha
export class UserService{
    async create(data: Prisma.UserCreateInput): Promise<UserResponse>{
        const existeUser= await prisma.user.findUnique({
            where :{ email: data.email },
        });
        if(existeUser){
            throw new Error('Já existe um usuário cadastrado com este email');
        }
        const hashePassword = await bcrypt.hash(data.password,8); // gera o hash da senha (custo 8)

        const user = await prisma.user.create({
            data:{
                ... data,
                password: hashePassword  //cria o usuario , porem trocando a senha digitada pelo usuario pelo  hash
            },
        });

        const {password, ...UserWithoutPassword} = user;   //remove a senha do objeto retornado
        return UserWithoutPassword; //retorna o usuario sem a senha
    }
    async findAll(): Promise<UserResponse[]>{
        const users = await prisma.user.findMany({
            orderBy : { createdAt: 'desc'},
        });
        return users.map(({password, ...user})=> user);  /// remove a senha de todos os usuarios, map() passa por cada usuario
    }
    async findById(id: string) : Promise<UserResponse>{
        const user = await prisma.user.findUnique({
            where: {id},
        });
        if(!user){
            throw new Error('Usuario não encontrado.')
        }
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword; 
    }
    async update(id: string , data: Prisma.UserUpdateInput): Promise<UserResponse>{
        await this.findById(id);

        if(data.password && typeof data.password === 'string'){
            data.password= await bcrypt.hash(data.password,8);
        }
        const updatedUser= await prisma.user.update({
            where: {id},
            data,
        });
        const { password, ...userWithoutPassword } = updatedUser;
        return userWithoutPassword;
    }
    async delete(id: string): Promise<void>{
        await this.findById(id);
        await prisma.user.delete({
            where: {id},
        });

    }

}