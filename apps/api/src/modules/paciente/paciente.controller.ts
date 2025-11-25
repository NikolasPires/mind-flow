// src/modules/paciente/paciente.controller.ts
import { Controller, Get, Param, Patch, Body } from "@nestjs/common";
import { PacienteService } from "./paciente.service";
import { UpdatePacienteDto } from "./dto/update-paciente.dto";

@Controller("patients")
export class PacienteController {
  constructor(private readonly pacienteService: PacienteService) {}

  @Get(":id")
  async findById(@Param("id") id: string) {
    return await this.pacienteService.findById(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() data: UpdatePacienteDto) {
    return await this.pacienteService.updatePaciente(id, data);
  }
}
