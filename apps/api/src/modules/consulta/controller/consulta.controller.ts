import { Controller, Post, Get, Put, Delete, Body, Param, Request } from '@nestjs/common';
import { ConsultaViewModel } from '../viewModel/ConsultaViewModel';
import { CreateConsultaBody } from '../dto/create-consulta.dto';
import { UpdateConsultaBody } from '../dto/update-consulta.dto';
import { CreateConsultaUseCase } from '../useCases/create-consulta.use-case';
import { ListConsultasUseCase } from '../useCases/list-consultas.use-case';
import { UpdateConsultaUseCase } from '../useCases/update-consulta.use-case';
import { DeleteConsultaUseCase } from '../useCases/delete-consulta.use-case';

@Controller('consultas')
export class ConsultaController {
  constructor(
    private createConsultaUseCase: CreateConsultaUseCase,
    private listConsultasUseCase: ListConsultasUseCase,
    private updateConsultaUseCase: UpdateConsultaUseCase,
    private deleteConsultaUseCase: DeleteConsultaUseCase,
  ) {}

  @Post()
  async createConsulta(@Body() body: CreateConsultaBody) {
    const { paciente_id, horario, tipo, categoria, tags, status, sugestao_IA, transcricao, anotacoes } = body;
    const consulta = await this.createConsultaUseCase.execute({
      paciente_id,
      horario: new Date(horario),
      tipo,
      categoria,
      tags,
      status,
      sugestao_IA,
      transcricao,
      anotacoes,
    });
    return ConsultaViewModel.toHttp(consulta);
  }

  @Get()
  async listConsultas(@Request() request: any) {
    const psicologoId = request.user?.id; // ID do usuário logado (que é o userId do psicólogo)
    const consultas = await this.listConsultasUseCase.execute(psicologoId);
    return consultas.map((consulta) => {
      if ('paciente' in consulta) {
        return ConsultaViewModel.toHttpWithPaciente(consulta as any);
      }
      return ConsultaViewModel.toHttp(consulta);
    });
  }

  @Put(':id')
  async updateConsulta(@Param('id') id: string, @Body() body: UpdateConsultaBody) {
    const { paciente_id, horario, tipo, categoria, tags, status, sugestao_IA, transcricao, anotacoes } = body;
    const consulta = await this.updateConsultaUseCase.execute({
      id,
      paciente_id,
      horario: horario ? new Date(horario) : undefined,
      tipo,
      categoria,
      tags,
      status,
      sugestao_IA,
      transcricao,
      anotacoes,
    });
    return ConsultaViewModel.toHttp(consulta);
  }

  @Delete(':id')
  async deleteConsulta(@Param('id') id: string) {
    await this.deleteConsultaUseCase.execute(id);
    return { message: 'Consulta deletada com sucesso.' };
  }
}

