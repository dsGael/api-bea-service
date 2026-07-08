export class FallaResponseDto {
  id!: string;
  idDispositivo!: string | null;
  nombre!: string;
  falla!: string | null;
  descripcion!: string | null;
  creadoPor!: string | null;
  fechaCreacion!: Date | null;
  modificadoPor!: string | null;
  fechaModificacion!: Date | null;

  static fromPrisma(falla: any): FallaResponseDto {
    return {
      id: falla.idFalla,
      idDispositivo: falla.idDispositivo,
      nombre: falla.nombre,
      falla: falla.falla,
      descripcion: falla.descripcionFalla,
      creadoPor: falla.creadoPor,
      fechaCreacion: falla.fechaCreacion,
      modificadoPor: falla.modificadoPor,
      fechaModificacion: falla.fechaModificacion,
    };
  }
}