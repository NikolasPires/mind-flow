import { Controller, Post, Get, Body, Request, UnauthorizedException, Param, ForbiddenException, Patch } from '@nestjs/common';
import { UserViewModel } from '../viewModel/UserViewModel';
import { PacienteViewModel } from '../viewModel/PacienteViewModel';
import { Public } from 'src/modules/auth/decorators/isPublic';
import { CreatePsicologoBody } from '../dto/create-psicologo.dto';
import { CreatePacienteBody } from '../dto/create-paciente.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdatePsicologoDto } from '../dto/update-psicologo.dto';
import { CreatePsicologoUseCase } from '../useCases/createUserUseCase/create-psicologo.use-case';
import { CreatePacienteUseCase } from '../useCases/createUserUseCase/create-paciente.use-case';
import { CreatePacienteWithPsicologoUseCase } from '../useCases/create-paciente-with-psicologo.use-case';
import { ListPacientesUseCase } from '../useCases/list-pacientes.use-case';
import { GetPacienteProfileUseCase } from '../useCases/getUserUseCase/getPacienteUseCase';
import { GetUserProfileUseCase } from '../useCases/getUserProfileUseCase/get-user-profile.use-case';
import { UpdateUserProfileUseCase } from '../useCases/updateUserProfileUseCase/update-user-profile.use-case';

@Controller('users')
export class UserController {
  constructor(
    private createPsicologoUseCase: CreatePsicologoUseCase,
    private createPacienteUseCase: CreatePacienteUseCase,
    private createPacienteWithPsicologoUseCase: CreatePacienteWithPsicologoUseCase,
    private listPacientesUseCase: ListPacientesUseCase,
    private getPacienteProfileUseCase: GetPacienteProfileUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
    private updateUserProfileUseCase: UpdateUserProfileUseCase,
  ) {}

  @Post('psicologo')
  @Public()
  async createPsicologo(@Body() body: CreatePsicologoBody) {
    const { email, name, password, crp } = body;
    const user = await this.createPsicologoUseCase.execute({ 
      email, 
      name, 
      password, 
      crp 
    });
    return UserViewModel.toHttp(user);
  }

  @Post('paciente')
  @Public()
  async createPaciente(@Body() body: CreatePacienteBody) {
    const { email, name, password, cpf, gender } = body;
    const user = await this.createPacienteUseCase.execute({ 
      email, 
      name, 
      password, 
      cpf, 
      gender 
    });
    return UserViewModel.toHttp(user);
  }
  @Get('paciente/:id') 
  async getPacienteById(
    @Param('id') pacienteId: string,
    @Request() request: any,   
  ) {
    const pacienteProfile = await this.getPacienteProfileUseCase.execute(pacienteId);
    return pacienteProfile;
  }

  @Post('patients')
  async createPatient(@Request() request: any, @Body() body: CreatePacienteBody) {
    const psicologoId = request.user.id; // ID do usuário logado (que é o userId do psicólogo)
    console.log(request.user)
    const { email, name, password, cpf, gender } = body;
    const user = await this.createPacienteWithPsicologoUseCase.execute({
      email, 
      name, 
      password, 
      cpf, 
      gender,
      psicologoId,
    });
    return UserViewModel.toHttp(user);
  }

  @Get('patients')
  async getPatients(@Request() request: any) {
    const psicologoId = request.user.id; // ID do usuário logado (que é o userId do psicólogo)
    const pacientes = await this.listPacientesUseCase.execute({ psicologoId });
    return PacienteViewModel.toHttpList(pacientes);
  }

  @Get('me')
  async getProfile(@Request() request: any) {
    const userId = request.user.id;
    const profile = await this.getUserProfileUseCase.execute(userId);
    return profile;
  }

  @Patch('me')
  async updateProfile(
    @Request() request: any,
    @Body() body: UpdateUserDto & Partial<UpdatePsicologoDto>,
  ) {
    const userId = request.user.id;
    const { bio, schedule_settings, ...userData } = body;
    const profileData: UpdatePsicologoDto | undefined = 
      (bio !== undefined || schedule_settings !== undefined) 
        ? { bio, schedule_settings } 
        : undefined;
    const result = await this.updateUserProfileUseCase.execute(userId, userData, profileData);
    return result;
  }
}