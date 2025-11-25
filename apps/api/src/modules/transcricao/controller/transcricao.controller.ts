import { Controller, Post, Get, Put, Delete, Body, Param } from '@nestjs/common';
import { TranscricaoViewModel } from '../viewModel/TranscricaoViewModel';
import { CreateTranscricaoBody } from '../dto/create-transcricao.dto';
import { UpdateTranscricaoBody } from '../dto/update-transcricao.dto';
import { CreateTranscricaoUseCase } from '../useCases/create-transcricao.use-case';
import { ListTranscricoesUseCase } from '../useCases/list-transcricoes.use-case';
import { FindTranscricaoUseCase } from '../useCases/find-transcricao.use-case';
import { UpdateTranscricaoUseCase } from '../useCases/update-transcricao.use-case';
import { DeleteTranscricaoUseCase } from '../useCases/delete-transcricao.use-case';

@Controller('transcricoes')
export class TranscricaoController {
  constructor(
    private createTranscricaoUseCase: CreateTranscricaoUseCase,
    private listTranscricoesUseCase: ListTranscricoesUseCase,
    private findTranscricaoUseCase: FindTranscricaoUseCase,
    private updateTranscricaoUseCase: UpdateTranscricaoUseCase,
    private deleteTranscricaoUseCase: DeleteTranscricaoUseCase,
  ) {}

  @Post()
  async createTranscricao(@Body() body: CreateTranscricaoBody) {
    const { texto_gerado, status } = body;
    const transcricao = await this.createTranscricaoUseCase.execute({ 
      texto_gerado, 
      status,
    });
    return TranscricaoViewModel.toHttp(transcricao);
  }

  @Get()
  async listTranscricoes() {
    const transcricoes = await this.listTranscricoesUseCase.execute();
    return transcricoes.map((transcricao) => TranscricaoViewModel.toHttp(transcricao));
  }

  @Get(':id')
  async findTranscricao(@Param('id') id: string) {
    const transcricao = await this.findTranscricaoUseCase.execute(id);
    return TranscricaoViewModel.toHttp(transcricao);
  }

  @Put(':id')
  async updateTranscricao(@Param('id') id: string, @Body() body: UpdateTranscricaoBody) {
    const { texto_gerado, status } = body;
    const transcricao = await this.updateTranscricaoUseCase.execute({
      id,
      texto_gerado,
      status,
    });
    return TranscricaoViewModel.toHttp(transcricao);
  }

  @Delete(':id')
  async deleteTranscricao(@Param('id') id: string) {
    await this.deleteTranscricaoUseCase.execute(id);
    return { message: 'Transcrição deletada com sucesso.' };
  }
}

